import botService from "./bot.service.js";
import { errorHandler } from "../../utils/error.js";

export const startBot = async (req, res, next) => {
  try {
    
    await botService.initBrowser();

    const isLoggedIn = await botService.checkLoginStatus();

    let ads = [];
    if (isLoggedIn) {
      // جلب الإعلانات تلقائياً بعد التسجيل الناجح
      ads = await botService.getMyAds();
    }

    res.status(200).json({
      success: true,
      message: "Haraj bot started successfully",
      isRunning: true,
      isLoggedIn: isLoggedIn,
      ads: ads,
    });
  } catch (error) {
    next(errorHandler(500, `Failed to start haraj bot: ${error.message}`));
  }
};

export const getBotStatus = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      isRunning: !!botService.browser,
      isLoggedIn: botService.isLoggedIn,
    });
  } catch (error) {
    next(errorHandler(500, `Failed to get bot status: ${error.message}`));
  }
};

export const stopBot = async (req, res, next) => {
  try {
    const result = await botService.stop();
    res.status(200).json(result);
  } catch (error) {
    next(errorHandler(500, `Failed to stop bot: ${error.message}`));
  }
};

export const getLoginStatus = async (req, res, next) => {
  try {
    const isLoggedIn = await botService.checkLoginStatus();
    res.status(200).json({
      success: true,
      isLoggedIn: isLoggedIn,
    });
  } catch (error) {
    next(errorHandler(500, `Failed to check login status: ${error.message}`));
  }
};

export const getMyAds = async (req, res, next) => {
  try {
    const ads = await botService.getMyAds();
    res.status(200).json({
      success: true,
      ads: ads,
    });
  } catch (error) {
    next(errorHandler(500, `Failed to get ads: ${error.message}`));
  }
};

export const startAutoUpdate = async (req, res, next) => {
  try {
    const result = await botService.startAutoUpdate();
    
    res.status(200).json({
      success: true,
      message: "Auto-update system started",
      data: result
    });
  } catch (error) {
    next(errorHandler(500, `Failed to start auto-update: ${error.message}`));
  }
};

export const stopAutoUpdate = async (req, res, next) => {
  try {
    const result = botService.stopAutoUpdate();
    
    res.status(200).json({
      success: true,
      message: "Auto-update system stopped",
      data: result
    });
  } catch (error) {
    next(errorHandler(500, `Failed to stop auto-update: ${error.message}`));
  }
};

export const getSchedulerStatus = async (req, res, next) => {
  try {
    const status = botService.getSchedulerStatus();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(errorHandler(500, `Failed to get scheduler status: ${error.message}`));
  }
};

export const updateAllAds = async (req, res, next) => {
  try {
    const result = await botService.updateAllAds();
    
    res.status(200).json({
      success: true,
      message: `Updated ${result.updated}/${result.total} ads`,
      data: result
    });
  } catch (error) {
    next(errorHandler(500, `Failed to update all ads: ${error.message}`));
  }
};