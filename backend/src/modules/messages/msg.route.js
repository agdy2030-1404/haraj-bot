import express from "express";
import * as msgController from "./msg.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.get("/", verifyToken, msgController.getMessages);
router.post("/process", verifyToken, msgController.processMessages);
router.post("/process/:adId", verifyToken, msgController.processMessages);
router.get("/templates", verifyToken, msgController.getTemplates);
router.post("/templates", verifyToken, msgController.createTemplate);
router.put("/templates/:id", verifyToken, msgController.updateTemplate); // إضافة التعديل
router.delete("/templates/:id", verifyToken, msgController.deleteTemplate); // إضافة الحذف

export default router;