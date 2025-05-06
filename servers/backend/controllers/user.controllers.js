import { Conversation } from "../models/transcript.schema.js";
import User from "../models/user.schema.js";

const setOnline = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOneAndUpdate({ email }, { isOnline: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User is online" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const setOffline = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOneAndUpdate({ email }, { isOnline: false });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User is offline" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ isOnline: true });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const saveVideoCall = async (req, res) => {
  const { email1, email2, conversationId } = req.body;
  try {
    const user1 = await User.findOne({ email: email1 });
    const user2 = await User.findOne({ email: email2 });

    if (!user1 || !user2) {
      return res.status(404).json({ message: "User not found" });
    }

    await user1.updateOne({ $addToSet: { videoCalls: conversationId } });
    await user2.updateOne({ $addToSet: { videoCalls: conversationId } });
    return res.status(200).json({ message: "Video call saved successfully" });
  } catch (error) {
    console.error("Error saving video call:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllVideoCalls = async (req, res) => {
  try {
    const { email } = req.params;
    const videoCalls = await Conversation.find({ participants: email });

    if (!videoCalls) {
      return res.status(404).json({ message: "No video calls found" });
    }

    // Populate the messages field with the actual message data
    for (const call of videoCalls) {
      await call.populate("messages");
    }

    return res.status(200).json(videoCalls);
  } catch (error) {
    console.log("error in fetching video calls", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  setOnline,
  setOffline,
  getOnlineUsers,
  getAllUsers,
  getAllVideoCalls,
  saveVideoCall,
};
