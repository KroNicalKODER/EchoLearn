const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
//   speakerId: {
//     type: String,
//     required: true,
//   },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
//   messageType: {
//     type: String,
//     enum: ['speech', 'text'],
//     required: true,
//   },
});

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
//   user1Id: {
//     type: String,
//     required: true,
//   },
//   user2Id: {
//     type: String,
//     required: true,
//   },
  messages: [messageSchema],
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
