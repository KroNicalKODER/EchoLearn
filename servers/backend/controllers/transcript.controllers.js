import Conversation from "../models/transcript.schema.js";

export const saveTranscript = async (req, res) => {
    try {
        const { transcript, roomId } = req.body;
        const newMessage = {
            message: transcript,
            timestamp: new Date(),
        };

        let conversation = await Conversation.findOne({ roomId });

        if (!conversation) {
            conversation = new Conversation({
                roomId,
                messages: [newMessage],
            });
        } else {
            conversation.messages.push(newMessage);
        }

        await conversation.save();
        res.status(201).json({ message: "Transcript saved successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getTranscripts = async (req, res) => {
    try {
        const { roomId } = req.params;
        const conversation = await Conversation.findOne({ roomId });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        res.status(200).json({ conversation });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}
