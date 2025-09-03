import Message from "./msg.model.js";
import { errorHandler } from "../../utils/error.js";
import botService from "../bot/bot.service.js";

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const messages = await Message.find(query)
      .sort({ receivedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب الرسائل: ${error.message}`));
  }
};

// إضافة دالة جديدة لتحديث الرسالة الموحدة
export const updateUnifiedMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    // هنا يمكنك حفظ الرسالة في قاعدة البيانات إذا لزم الأمر
    // أو في ملف إعدادات المستخدم

    res.status(200).json({
      success: true,
      message: "تم تحديث الرسالة الموحدة بنجاح",
      data: { message },
    });
  } catch (error) {
    next(errorHandler(500, `فشل في تحديث الرسالة الموحدة: ${error.message}`));
  }
};

export const processMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const adId = req.params.adId || null;

    // معالجة الرسائل في حراج
    const result = await botService.processMessages(adId, userId);

    res.status(200).json({
      success: true,
      message: `تم معالجة ${result.processed} رسالة`,
      data: result,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في معالجة الرسائل: ${error.message}`));
  }
};
