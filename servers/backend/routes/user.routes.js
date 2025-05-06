import express from "express";
import {
  setOnline,
  setOffline,
  getAllUsers,
  getOnlineUsers,
  getAllVideoCalls,
} from "../controllers/user.controllers.js";

const router = express.Router();

router.post("/setOnline", setOnline);
router.post("/setOffline", setOffline);
router.get("/getOnlineUsers", getOnlineUsers);
router.get("/getAllUsers", getAllUsers);
router.get("/getAllVideoCalls/:email", getAllVideoCalls);

export default router;
