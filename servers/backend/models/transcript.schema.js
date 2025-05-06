import mongoose from "mongoose";

// Message Schema
const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);
export { Message, Conversation };
