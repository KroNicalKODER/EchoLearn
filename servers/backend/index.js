import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from "./routes/auth.routes.js";
import transcriptRoutes from "./routes/transcript.routes.js";
import cors from 'cors';
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use('/auth', authRoutes);
app.use('/transcript', transcriptRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected');
}).catch((error) => {
    console.log(error);
});

app.listen(process.env.PORT || 6000, () => {
    console.log(`Server is running on port ${process.env.PORT || "6000"}`);
});