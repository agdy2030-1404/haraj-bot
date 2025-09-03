import express from "express";
import * as msgController from "./msg.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.get("/", verifyToken, msgController.getMessages);
router.post("/process", verifyToken, msgController.processMessages);
router.post("/process/:adId", verifyToken, msgController.processMessages);
router.put("/unified-message", verifyToken, msgController.updateUnifiedMessage);

export default router;
