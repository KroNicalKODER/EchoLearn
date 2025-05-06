import { Conversation, Message } from "../models/transcript.schema.js";
import User from "../models/user.schema.js";

export const saveTranscript = async (req, res) => {
  console.log("Saving transcript...");
  try {
    const { transcript, roomId, email } = req.body;

    const messageDoc = await Message.create({
      email,
      message: transcript,
      timestamp: new Date(),
    });

    let conversation = await Conversation.findOne({ roomId });

    if (!conversation) {
      conversation = new Conversation({
        roomId,
        messages: [messageDoc._id],
      });
    } else {
      const participantExists = conversation.participants.some(
        (participant) => participant === email
      );
      if (!participantExists) {
        conversation.participants.push(email);
      }
      conversation.messages.push(messageDoc._id);
    }

    await conversation.save();
    res.status(201).json({ message: "Transcript saved successfully" });
  } catch (error) {
    console.error("Error saving transcript:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTranscripts = async (req, res) => {
  try {
    const { roomId } = req.params;

    const conversation = await Conversation.findOne({ roomId }).populate(
      "messages"
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json({ messages: conversation.messages });
  } catch (error) {
    console.error("Error fetching transcripts:", error);
    res.status(500).json({ message: "Server error" });
  }
};
