
const express = require("express");
const mongoose = require("mongoose");

const Conversation = require("../models/conversation");
const PrivateMessage = require("../models/privateMessage");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/conversations
// Find an existing conversation or create a new one
router.post("/", async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { receiverId } = req.body;

    if (
      !receiverId ||
      !mongoose.isValidObjectId(receiverId)
    ) {
      return res.status(400).json({
        message: "Valid receiverId is required",
      });
    }

    if (currentUserId === receiverId) {
      return res.status(400).json({
        message: "You cannot start a conversation with yourself",
      });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    const conversationKey = Conversation.generateKey(
      currentUserId,
      receiverId
    );

    const conversation = await Conversation.findOneAndUpdate(
      { conversationKey },
      {
        $setOnInsert: {
          participants: [currentUserId, receiverId],
          conversationKey,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    ).populate("participants", "username email profilePicture");

    return res.status(200).json({
      message: "Conversation ready",
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      message: "Could not create conversation",
    });
  }
});

// GET /api/conversations
// List only conversations belonging to the current user


router.get("/", async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find conversations belonging to this user
    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate("participants", "username email profilePicture")
      .lean();

    // Add unread counts and latest message details
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Count unread messages from the other user
        const unreadCount =
          await PrivateMessage.countDocuments({
            conversation: conversation._id,
            sender: { $ne: currentUserId },
            read: { $ne: true },
          });

        // Find the newest message in this conversation
        const latestMessage = await PrivateMessage.findOne({
          conversation: conversation._id,
        })
          .sort({ createdAt: -1, _id: -1 })
          .select("text sender createdAt read")
          .lean();

          console.log("Conversation ID:", conversation._id);
          console.log("Latest message:", latestMessage);

        return {
          ...conversation,
          unreadCount,

          lastMessage: latestMessage
            ? {
                id: latestMessage._id.toString(),
                text: latestMessage.text,
                senderId: latestMessage.sender.toString(),
                createdAt: latestMessage.createdAt,
                read: latestMessage.read === true,
              }
            : null,

          lastMessageAt:
            latestMessage?.createdAt || null,
        };
      })
    );

    // Most recently active conversations appear first
    conversationsWithDetails.sort((a, b) => {
      const timeA = a.lastMessageAt
        ? new Date(a.lastMessageAt).getTime()
        : 0;

      const timeB = b.lastMessageAt
        ? new Date(b.lastMessageAt).getTime()
        : 0;

      return timeB - timeA;
    });

    return res.status(200).json({
      conversations: conversationsWithDetails,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      message: "Could not fetch conversations",
    });
  }
});


// GET /api/conversations/:conversationId/messages
// Retrieve previous private messages
router.get("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const messages = await PrivateMessage.find({
      conversation: conversationId,
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(100)
      .populate("sender", "username")
      .lean();

    return res.status(200).json({
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error("Get private messages error:", error);

    return res.status(500).json({
      message: "Could not fetch private messages",
    });
  }
});



// PATCH /api/conversations/:conversationId/read
// Mark incoming messages in a conversation as read
router.patch("/:conversationId/read", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId,
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const result = await PrivateMessage.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: currentUserId },
        read: { $ne: true },
      },
      {
        $set: { read: true },
      }
    );

    const readMessages = await PrivateMessage.find({
      conversation: conversation._id,
      sender: { $ne: currentUserId },
      read: true,
    })
      .select("_id")
      .lean();

    return res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
      unreadCount: 0,
      readMessageIds: readMessages.map((item) =>
        item._id.toString()
      ),
    });
  } catch (error) {
    console.error("Mark messages read error:", error);

    return res.status(500).json({
      message: "Could not mark messages as read",
    });
  }
});


// const mongoose = require("mongoose");

// EDIT MESSAGE
router.patch(
  "/:conversationId/messages/:messageId",
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { conversationId, messageId } = req.params;
      const { text } = req.body;

      if (
        !mongoose.isValidObjectId(conversationId) ||
        !mongoose.isValidObjectId(messageId)
      ) {
        return res.status(400).json({
          message: "Invalid conversation or message ID",
        });
      }

      if (
        typeof text !== "string" ||
        !text.trim() ||
        text.trim().length > 5000
      ) {
        return res.status(400).json({
          message: "Message must contain 1-5000 characters",
        });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }

      const message = await PrivateMessage.findOneAndUpdate(
        {
          _id: messageId,
          conversation: conversationId,
          sender: userId,
          deleted: { $ne: true },
        },
        {
          $set: {
            text: text.trim(),
            edited: true,
            editedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({
          message: "Message not found or not editable",
        });
      }

      const io = req.app.get("io");

      io?.to(`user:${String(conversation.participants[0])}`)
        .to(`user:${String(conversation.participants[1])}`)
        .emit("private:message:updated", {
          conversationId: String(conversationId),
          messageId: String(message._id),
          text: message.text,
          edited: true,
          editedAt: message.editedAt,
          deleted: false,
        });

      return res.json({
        message: "Message edited successfully",
        updatedMessage: message,
      });
    } catch (error) {
      console.error("Edit message error:", error);
      return res.status(500).json({
        message: "Failed to edit message",
      });
    }
  }
);

// DELETE MESSAGE
router.delete(
  "/:conversationId/messages/:messageId",
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { conversationId, messageId } = req.params;

      if (
        !mongoose.isValidObjectId(conversationId) ||
        !mongoose.isValidObjectId(messageId)
      ) {
        return res.status(400).json({
          message: "Invalid conversation or message ID",
        });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }

      const message = await PrivateMessage.findOneAndUpdate(
        {
          _id: messageId,
          conversation: conversationId,
          sender: userId,
          deleted: { $ne: true },
        },
        {
          $set: {
            text: "",
            deleted: true,
            deletedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({
          message: "Message not found or already deleted",
        });
      }

      const io = req.app.get("io");

      io?.to(`user:${String(conversation.participants[0])}`)
        .to(`user:${String(conversation.participants[1])}`)
        .emit("private:message:updated", {
          conversationId: String(conversationId),
          messageId: String(message._id),
          text: "",
          edited: message.edited,
          deleted: true,
          deletedAt: message.deletedAt,
        });

      return res.json({
        message: "Message deleted successfully",
        updatedMessage: message,
      });
    } catch (error) {
      console.error("Delete message error:", error);
      return res.status(500).json({
        message: "Failed to delete message",
      });
    }
  }
);




module.exports = router;
