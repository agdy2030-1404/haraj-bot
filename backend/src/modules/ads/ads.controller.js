// ads.controller.js
import Ad from "./ads.model.js";
import { errorHandler } from "../../utils/error.js";
import botService from "../bot/bot.service.js";

export const fetchUserAds = async (req, res, next) => {
  try {
    // جلب الإعلانات من الموقع فقط
    const ads = await botService.getMyAds();

    // إضافة status افتراضي إذا لم يكن موجوداً
    const adsWithStatus = ads.map(ad => ({
      ...ad,
      status: ad.status || "active" // إضافة status افتراضي
    }));

    res.status(200).json({
      success: true,
      message: `تم جلب ${adsWithStatus.length} إعلان بنجاح`,
      data: adsWithStatus, // إرجاع الإعلانات مباشرة من الموقع مع status
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب الإعلانات: ${error.message}`));
  }
};

export const getUserAds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const ads = await Ad.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: ads,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب الإعلانات: ${error.message}`));
  }
};

export const getAdDetails = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    const ad = await Ad.findOne({ adId, userId });
    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    res.status(200).json({
      success: true,
      data: ad,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب تفاصيل الإعلان: ${error.message}`));
  }
};

export const updateAd = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    // التحقق من وجود الإعلان
    const ad = await Ad.findOne({ adId, userId });
    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    // تنفيذ التحديث
    const result = await botService.updateAd(adId);

    if (result.success) {
      // تحديث قاعدة البيانات
      const nextRandomHours = Math.floor(Math.random() * 29) + 20;

      // أو مع التحقق
      const nextUpdateTimestamp = Date.now() + nextRandomHours * 60 * 60 * 1000;
      const nextUpdate = new Date();
      nextUpdate.setHours(nextUpdate.getHours() + nextRandomHours);
      const updatedAd = await Ad.findOneAndUpdate(
        { adId, userId },
        {
          lastUpdated: new Date(),
          nextUpdate: nextUpdate,
          updateCount: ad.updateCount + 1,
          updateError: "",
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "تم تحديث الإعلان بنجاح",
        data: updatedAd,
      });
    } else {
      throw new Error("فشل في تحديث الإعلان");
    }
  } catch (error) {
    next(errorHandler(500, `فشل في تحديث الإعلان: ${error.message}`));
  }
};

export const scheduleAdUpdate = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    const ad = await Ad.findOne({ adId, userId });
    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    // التحقق من صحة تاريخ nextUpdate قبل الجدولة
    let nextUpdateDate = ad.nextUpdate;
    if (!nextUpdateDate || isNaN(nextUpdateDate.getTime())) {
      console.warn(`Invalid nextUpdate for ad ${adId}, resetting to default`);
      nextUpdateDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // تحديث قيمة nextUpdate في قاعدة البيانات
      ad.nextUpdate = nextUpdateDate;
      await ad.save();
    }

    // جدولة التحديث
    scheduler.scheduleSingleAd(ad);

    res.status(200).json({
      success: true,
      message: "تم جدولة التحديث بنجاح",
      nextUpdate: nextUpdateDate,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جدولة التحديث: ${error.message}`));
  }
};