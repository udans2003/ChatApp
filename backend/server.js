
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const Conversation = require("./models/conversation");
const PrivateMessage = require("./models/privateMessage");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/message");
const User = require("./models/user");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

const onlineUsers = new Map();

function broadcastOnlineUsers() {
  const usersById = new Map(
    Array.from(onlineUsers.values()).map((user) => [
      String(user.id),
      user,
    ])
  );

  io.emit("users:online", Array.from(usersById.values()));
}

// Authenticate every Socket.IO connection using JWT
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token is required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.username) {
      return next(new Error("Invalid authentication token"));
    }

    // Attach verified user information to the socket
    socket.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired authentication token"));
  }
});

function formatMessage(message) {
  return {
    id: message._id.toString(),
    sender: message.sender,
    text: message.text,
    time: new Date(message.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

app.get("/", (req, res) => {
  res.send("ChatWave server is running!");
});


 // Stage 6.5 - Track online users
 const onlineUserSockets = new Map();

 function addOnlineUser(userId, socketId) {
   const id = String(userId);

   if (!onlineUserSockets.has(id)) {
     onlineUserSockets.set(id, new Set());
   }

   const sockets = onlineUserSockets.get(id);
   const wasOffline = sockets.size === 0;

   sockets.add(socketId);

   return wasOffline;
 }

 function removeOnlineUser(userId, socketId) {
   const id = String(userId);
   const sockets = onlineUserSockets.get(id);

   if (!sockets) return false;

   sockets.delete(socketId);

   if (sockets.size === 0) {
     onlineUserSockets.delete(id);
     return true;
   }

   return false;
 }

 function getOnlineUserIds() {
   return Array.from(onlineUserSockets.keys());
 }


io.on("connection", async (socket) => {
  const userId = socket.user.id;
  const username = socket.user.username;

  // Each user gets a private room
socket.join(`user:${userId}`);


 // Stage 6.5 - User connected

 const becameOnline = addOnlineUser(userId, socket.id);

console.log("Connected user:", username);
console.log("User ID:", userId);
console.log("Online users:", getOnlineUserIds());
console.log("Became online:", becameOnline);

 // Send the complete online-user list to this socket
 socket.emit("presence:list", {
   onlineUserIds: getOnlineUserIds(),
 });

 // Notify other connected users only on first connection
 if (becameOnline) {
   socket.broadcast.emit("presence:update", {
     userId: String(userId),
     isOnline: true,
   });
 }

 // Broadcast the current unique online-user count
io.emit("users:online", {
  count: getOnlineUserIds().length,
});

 console.log(`${username} is online`);


console.log(`${username} joined private room user:${userId}`);

  console.log(`${username} authenticated and connected`);

  // Add authenticated user to online users
  onlineUsers.set(socket.id, {
    id: userId,
    username: username,
  });

  broadcastOnlineUsers();
  console.log("Current online users:", Array.from(onlineUsers.values()));

  // Load previous messages from MongoDB
  try {
    const history = await Message.find()
      .sort({ createdAt: -1, _id: -1 })
      .limit(100)
      .lean();

    socket.emit(
      "chat:history",
      history.reverse().map(formatMessage)
    );
  } catch (error) {
    console.error("Could not load chat history:", error);

    socket.emit(
      "chat:error",
      "Could not load chat history."
    );
  }

  // Receive messages from authenticated users
  socket.on("chat:send", async (message) => {
    if (!message || typeof message.text !== "string") {
      return;
    }

    const text = message.text.trim();

    if (!text || text.length > 2000) {
      return;
    }

    try {
      // Sender is obtained from the verified JWT, not the client
      const savedMessage = await Message.create({
        sender: username,
        text: text,
      });

      const chatMessage = formatMessage(savedMessage);

      io.emit("chat:receive", chatMessage);
    } catch (error) {
      console.error("Could not save message:", error);

      socket.emit(
        "chat:error",
        "Message could not be saved. Please try again."
      );
    }
  });


  // Send a private message
  socket.on("private:send", async (data, callback) => {
    const respond =
      typeof callback === "function" ? callback : () => {};

    try {
      if (
        !data ||
        !mongoose.isValidObjectId(data.conversationId) ||
        typeof data.text !== "string"
      ) {
        return respond({
          success: false,
          message: "Invalid message data",
        });
      }

      const text = data.text.trim();

      if (!text || text.length > 2000) {
        return respond({
          success: false,
          message: "Message must contain 1–2000 characters",
        });
      }

      // Verify that the sender belongs to the conversation
      const conversation = await Conversation.findOne({
        _id: data.conversationId,
        participants: userId,
      });

      if (!conversation) {
        return respond({
          success: false,
          message: "Conversation not found or access denied",
        });
      }

      // Save message in MongoDB
      const savedMessage = await PrivateMessage.create({
        conversation: conversation._id,
        sender: userId,
        text,
      });

      const messageData = {
        id: savedMessage._id.toString(),
        conversationId: conversation._id.toString(),
        senderId: userId,
        sender: username,
        text: savedMessage.text,
        read: savedMessage.read,
        createdAt: savedMessage.createdAt,
      };

      // Send only to the two conversation participants
      for (const participantId of conversation.participants) {
        io.to(`user:${participantId.toString()}`).emit(
          "private:receive",
          messageData
        );
      }

      // Update conversation activity time
      await Conversation.updateOne(
        { _id: conversation._id },
        { $set: { updatedAt: new Date() } }
      );

      respond({
        success: true,
        message: messageData,
      });
    } catch (error) {
      console.error("Private message error:", error);

      respond({
        success: false,
        message: "Could not send private message",
      });
    }
  });


  // Notify both participants to refresh conversation status
  socket.on("private:read", async (data) => {
    try {
      if (
        !data ||
        !mongoose.isValidObjectId(data.conversationId)
      ) {
        return;
      }

      const conversation = await Conversation.findOne({
        _id: data.conversationId,
        participants: socket.user.id,
      });

      if (!conversation) return;

      // Notify the participants only
      for (const participantId of conversation.participants) {
        io.to(`user:${participantId.toString()}`).emit(
          "private:read:update",
          {
            conversationId: conversation._id.toString(),
          }
        );
      }
    } catch (error) {
      console.error("Private read notification error:", error);
    }
  });


  // Stage 6.4 - Private typing indicators

  socket.on("private:typing", async (data) => {
    try {
      const { conversationId, isTyping } = data || {};

      // Validate incoming data
      if (
        !mongoose.isValidObjectId(conversationId) ||
        typeof isTyping !== "boolean"
      ) {
        return;
      }

      // Security: user must belong to this conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) return;

      // Find the other participant
      const receiverId = conversation.participants.find(
        (participantId) =>
          participantId.toString() !== userId.toString()
      );

      if (!receiverId) return;

      const currentUser = await User.findById(userId).select("username");
      if (!currentUser) return;

      // Send typing status only to the other participant
      io.to(`user:${receiverId.toString()}`).emit(
        "private:typing:update",
        {
          conversationId: conversation._id.toString(),
          userId: userId.toString(),
          username: currentUser.username,
          isTyping,
        }
      );
    } catch (error) {
      console.error("Private typing error:", error);
    }
  });




  // Handle disconnection
  socket.on("disconnect", (reason) => {
  console.log(`${username} disconnected:`, reason);

  onlineUsers.delete(socket.id);
  broadcastOnlineUsers();

  const becameOffline = removeOnlineUser(
    userId,
    socket.id
  );

  console.log("Became offline:", becameOffline);

  if (becameOffline) {
    io.emit("presence:update", {
      userId: String(userId),
      isOnline: false,
    });

    console.log(`Broadcasting ${username} as offline`);
  }
});

 io.emit("users:online", {
    count: getOnlineUserIds().length,
  });

  console.log(
    "Unique online users:",
    getOnlineUserIds().length
  );
});


const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB successfully!");

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Another ChatApp backend server is likely already running.`
        );
        process.exitCode = 1;
        return;
      }

      console.error("ChatWave server failed:", error);
      process.exitCode = 1;
    });

    server.listen(PORT, () => {
      console.log(`ChatWave server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start ChatWave:", error.message);
    process.exit(1);
  }
}

startServer();
