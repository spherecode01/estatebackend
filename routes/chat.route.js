import express from "express";
import {
  getChats,
  getChat,
  addChat,
  readChat,
} from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/",  getChats);
router.get("/:id",  getChat);
router.post("/",  addChat);
router.put("/read/:id",  readChat);

export default router;