
const mongoose = require("mongoose");

const privateMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    read: {
      type: Boolean,
      default: false,
    },

    edited: {
    type: Boolean,
    default: false,
    },

    editedAt: {
    type: Date,
    default: null,
    },

    deleted: {
    type: Boolean,
    default: false,
    },

    deletedAt: {
    type: Date,
    default: null,
    },

  },
  {
    timestamps: true,
  }

  

);

// Efficiently retrieve messages in chronological order
privateMessageSchema.index({
  conversation: 1,
  createdAt: -1,
});

module.exports = mongoose.model("PrivateMessage", privateMessageSchema);
