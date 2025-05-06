import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import transcriptRoutes from "./routes/transcript.routes.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
import convertTextGridToJSON from "./utils/textGridToJSON/index.js";
import User from "./models/user.schema.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`Route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/auth", authRoutes);
app.use("/transcript", transcriptRoutes);
app.use("/user", userRoutes);

app.post("/tgtojson", async (req, res) => {
  console.log("Converting TextGrid to JSON...");
  try {
    const result = await convertTextGridToJSON();

    if (result.code !== 200) {
      return res.status(result.code).json(result);
    }

    const userPhones = result.data.tiers
      .find((tier) => tier.name === "phones")
      .intervals.filter((interval) => interval.text && interval.text !== "")
      .map((interval) => interval.text);

    const machinePhones = result.data1.tiers
      .find((tier) => tier.name === "phones")
      .intervals.filter((interval) => interval.text && interval.text !== "")
      .map((interval) => interval.text);

    res.status(200).json({
      phones: userPhones,
      phonesByMachine: machinePhones,
      score: result.score,
    });
  } catch (error) {
    console.error("Error in /tgtojson:", error);
    res.status(500).json({
      code: 500,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server is running on port ${process.env.PORT || "6000"}`);
});
