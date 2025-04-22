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

export { setOnline, setOffline, getOnlineUsers, getAllUsers };
