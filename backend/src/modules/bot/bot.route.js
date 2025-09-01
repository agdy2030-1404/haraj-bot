import express from "express";
import * as botController from "./bot.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/start", verifyToken, botController.startBot);
router.post("/stop", verifyToken, botController.stopBot);
router.get("/status", verifyToken, botController.getBotStatus);
router.get("/login-status", verifyToken, botController.getLoginStatus);
router.get("/ads", verifyToken, botController.getMyAds);
router.post("/auto-update/start", verifyToken, botController.startAutoUpdate);
router.post("/auto-update/stop", verifyToken, botController.stopAutoUpdate);
router.get("/auto-update/status", verifyToken, botController.getSchedulerStatus);
router.post("/ads/update-all", verifyToken, botController.updateAllAds);
export default router;