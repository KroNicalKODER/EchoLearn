import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from "./routes/auth.routes.js";
import transcriptRoutes from "./routes/transcript.routes.js";
import cors from 'cors';
import convertTextGridToJSON from './utils/textGridToJSON/index.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use('/auth', authRoutes);
app.use('/transcript', transcriptRoutes);

app.post('/tgtojson', async (req, res) => {
    try {
        const json = await convertTextGridToJSON();
        // Getting only phones from the JSON
        const phones = json.data.tiers.find(tier => tier.name === 'phones').intervals.map(interval => interval.text);
        const phonesByMachine = json.data1.tiers.find(tier => tier.name === 'phones').intervals.map(interval => interval.text);
        console.log(phones);
        res.status(200).json({phones: phones, phonesByMachine: phonesByMachine});
    } catch (error) {
        res.status(500).json({ code: 500, error: 'Internal Server Error', message: error });
    }
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected');
}).catch((error) => {
    console.log(error);
});

app.listen(process.env.PORT || 6000, () => {
    console.log(`Server is running on port ${process.env.PORT || "6000"}`);
});