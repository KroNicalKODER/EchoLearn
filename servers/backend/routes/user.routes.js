import express from "express";
import {
  setOnline,
  setOffline,
  getAllUsers,
  getOnlineUsers,
} from "../controllers/user.controllers.js";

const router = express.Router();

router.post("/setOnline", setOnline);
router.post("/setOffline", setOffline);
router.get("/getOnlineUsers", getOnlineUsers);
router.get("/getAllUsers", getAllUsers);

export default router;
