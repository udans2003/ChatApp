
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      required: true,
      validate: {
        validator: (users) =>
          users.length === 2 &&
          users[0].toString() !== users[1].toString(),
        message: "A private conversation must have two different users",
      },
    },

    // Stable key to prevent duplicate conversations
    conversationKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate the same key regardless of user order
conversationSchema.statics.generateKey = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()]
    .sort()
    .join("_");
};

module.exports = mongoose.model("Conversation", conversationSchema);
