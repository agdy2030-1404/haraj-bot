import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// استخدام إضافة التخفي لتجنب الكشف
puppeteer.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class botService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
    this.cookiesPath = path.join(__dirname, "haraj-cookies.json");
    this.updateQueue = [];
    this.isProcessingQueue = false;
    this.messageQueue = [];
    this.isProcessingMessages = false;
    this.lastLoginCheck = 0;
  }

  // دالة الانتظار المساعدة
  async wait(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }

  // دالة تهيئة المتصفح
  async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-web-security",
          "--disable-features=IsolateOrigins,site-per-process",
          "--window-size=1200,800",
        ],
        defaultViewport: null,
      });

      this.page = await this.browser.newPage();

      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      await this.page.setExtraHTTPHeaders({
        "Accept-Language": "ar-SA,ar;q=0.9,en;q=0.8",
      });

      await this.loadCookies();

      console.log("Browser initialized successfully");
      return { success: true, message: "Browser initialized" };
    } catch (error) {
      console.error("Error initializing browser:", error);
      throw error;
    }
  }

  // تحميل الكوكيز المحفوظة
  async loadCookies() {
    try {
      if (fs.existsSync(this.cookiesPath)) {
        const cookiesString = fs.readFileSync(this.cookiesPath, "utf8");
        const cookies = JSON.parse(cookiesString);

        console.log(`Loading ${cookies.length} cookies from file`);

        await this.page.setCookie(...cookies);
        console.log("Cookies loaded successfully");

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading cookies:", error);
      return false;
    }
  }

  // حفظ الكوكيز
  async saveCookies() {
    try {
      const cookies = await this.page.cookies();
      console.log(`Saving ${cookies.length} cookies`);

      fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
      console.log("Cookies saved successfully");
    } catch (error) {
      console.error("Error saving cookies:", error);
    }
  }

  // النقر على زر الدخول وفتح نافذة التسجيل
  async openLoginModal() {
    try {
      // الانتظار حتى يظهر زر الدخول
      await this.page.waitForSelector('button[data-testid="login-link"]', {
        timeout: 10000,
      });

      // النقر على زر الدخول
      await this.page.click('button[data-testid="login-link"]');

      // الانتظار حتى تظهر نافذة التسجيل
      await this.page.waitForSelector('input[id="username"]', {
        timeout: 10000,
      });

      console.log("Login modal opened successfully");
      return true;
    } catch (error) {
      console.error("Error opening login modal:", error);
      throw error;
    }
  }

  // إدخال اسم المستخدم أو رقم الجوال
  async enterUsername(username) {
    try {
      // الانتظار حتى يظهر حقل اسم المستخدم
      await this.page.waitForSelector('input[id="username"]', {
        timeout: 10000,
      });

      // مسح الحقل وإدخال اسم المستخدم
      await this.page.click('input[id="username"]', { clickCount: 3 });
      await this.page.type('input[id="username"]', username, { delay: 100 });

      console.log("Username entered successfully");
      return true;
    } catch (error) {
      console.error("Error entering username:", error);
      throw error;
    }
  }

  // النقر على زر التالي بعد إدخال اسم المستخدم
  async clickNextButton() {
    try {
      // الانتظار حتى يظهر زر التالي
      await this.page.waitForSelector(
        'button[data-testid="auth_submit_username"]',
        {
          timeout: 10000,
        }
      );

      // النقر على زر التالي
      await this.page.click('button[data-testid="auth_submit_username"]');

      // الانتظار حتى يظهر حقل كلمة المرور
      await this.page.waitForSelector('input[id="password"]', {
        timeout: 10000,
      });

      console.log("Next button clicked successfully");
      return true;
    } catch (error) {
      console.error("Error clicking next button:", error);
      throw error;
    }
  }

  // إدخال كلمة المرور
  async enterPassword(password) {
    try {
      // الانتظار حتى يظهر حقل كلمة المرور
      await this.page.waitForSelector('input[id="password"]', {
        timeout: 10000,
      });

      // مسح الحقل وإدخال كلمة المرور
      await this.page.click('input[id="password"]', { clickCount: 3 });
      await this.page.type('input[id="password"]', password, { delay: 100 });

      console.log("Password entered successfully");
      return true;
    } catch (error) {
      console.error("Error entering password:", error);
      throw error;
    }
  }

  // النقر على زر الدخول النهائي
  async clickLoginButton() {
    try {
      // الانتظار حتى يظهر زر الدخول
      await this.page.waitForSelector(
        'button[data-testid="auth_submit_login"]',
        {
          timeout: 10000,
        }
      );

      // النقر على زر الدخول
      await this.page.click('button[data-testid="auth_submit_login"]');

      // الانتظار حتى يتم التوجيه إلى الصفحة الرئيسية أو ظهور عناصر المستخدم
      await this.page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      console.log("Login button clicked successfully");
      return true;
    } catch (error) {
      console.error("Error clicking login button:", error);
      throw error;
    }
  }

  // تسجيل الدخول إلى موقع حراج
  async loginToHaraj() {
    try {
      if (!this.browser || !this.page) {
        await this.initBrowser();
      }

      // الانتقال إلى صفحة حراج
      await this.page.goto("https://haraj.com.sa", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // فتح نافذة التسجيل
      await this.openLoginModal();

      // إدخال اسم المستخدم أو رقم الجوال
      await this.enterUsername(process.env.HARAJ_USERNAME);

      // النقر على زر التالي
      await this.clickNextButton();

      // إدخال كلمة المرور
      await this.enterPassword(process.env.HARAJ_PASSWORD);

      // النقر على زر الدخول النهائي
      await this.clickLoginButton();

      // الانتظار قليلاً للتأكد من اكتمال عملية التسجيل
      await this.wait(5000);

      // التحقق من نجاح التسجيل
      const loginSuccessful = await this.verifyLogin();

      if (loginSuccessful) {
        // حفظ الكوكيز للجلسات القادمة
        await this.saveCookies();
        this.isLoggedIn = true;
        console.log("Login to Haraj successful");
        return true;
      } else {
        throw new Error("Login verification failed");
      }
    } catch (error) {
      console.error("Login to Haraj failed:", error);
      throw error;
    }
  }

  // التحقق من نجاح التسجيل
  async verifyLogin() {
    try {
      // التحقق من وجود زر القائمة المنسدلة للمستخدم
      await this.page.waitForSelector(
        'button[data-testid="user-menu-button"]',
        {
          timeout: 15000,
        }
      );

      // التحقق من وجود اسم المستخدم في القائمة
      const userMenuText = await this.page.$eval(
        'button[data-testid="user-menu-button"]',
        (el) => el.textContent
      );

      if (userMenuText && userMenuText.includes(process.env.HARAJ_USERNAME)) {
        console.log("Login verified successfully");
        return true;
      }

      // طريقة بديلة للتحقق: الانتقال إلى صفحة الملف الشخصي
      await this.page.goto(
        "https://haraj.com.sa/users/" + process.env.HARAJ_USERNAME,
        {
          waitUntil: "networkidle2",
          timeout: 30000,
        }
      );

      // التحقق من وجود معلومات الملف الشخصي
      const profileExists = await this.page.evaluate(() => {
        return document.querySelector("h1") !== null;
      });

      return profileExists;
    } catch (error) {
      console.error("Error verifying login:", error);
      return false;
    }
  }
  async ensureBotRunning() {
    try {
      console.log("Ensuring bot is running...");

      // إذا كان المتصفح غير موجود أو مغلق
      if (!this.browser) {
        console.log("Browser not found, initializing...");
        await this.initBrowser(); // أو await this.initBrowser() حسب الخيار الذي تختاره
        return true;
      }

      // إذا كانت الصفحة غير موجودة أو مغلقة
      if (!this.page || this.page.isClosed()) {
        console.log("Page not found or closed, creating new page...");
        this.page = await this.browser.newPage();

        // إعادة تطبيق الإعدادات
        await this.page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );
        await this.page.setExtraHTTPHeaders({
          "Accept-Language": "ar,en;q=0.9",
        });

        // تحميل الكوكيز إذا كانت موجودة
        await this.loadCookies();
      }

      // التحقق من تسجيل الدخول
      const isLoggedIn = await this.checkLoginStatus();

      if (!isLoggedIn) {
        console.log("Not logged in, attempting login...");
        await this.loginToHaraj();
      }

      console.log("✅ Bot is running and ready");
      return true;
    } catch (error) {
      console.error("Error ensuring bot is running:", error);

      // محاولة إعادة التشغيل الكامل
      try {
        await this.stop();
        await this.initBrowser(); // أو await this.initBrowser()
        return await this.checkLoginStatus();
      } catch (restartError) {
        console.error("Complete restart failed:", restartError);
        throw new Error(
          "Failed to ensure bot is running: " + restartError.message
        );
      }
    }
  }
  // التحقق من حالة التسجيل
  async checkLoginStatus() {
    try {
      if (!this.page) throw new Error("البوت غير مشغل بعد");

      // إذا كان مسجلاً الدخول مسبقاً
      if (this.isLoggedIn) return true;

      // التحقق من الكوكيز أولاً
      const cookiesLoaded = await this.loadCookies();

      if (cookiesLoaded) {
        // الذهاب إلى الصفحة الرئيسية
        await this.page.goto("https://haraj.com.sa", {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // الانتظار لمدة قصيرة للتحميل
        await this.wait(3000);

        // محاولة التحقق من وجود زر القائمة المنسدلة للمستخدم
        try {
          await this.page.waitForSelector(
            'button[data-testid="user-menu-button"]',
            {
              timeout: 5000,
            }
          );

          this.isLoggedIn = true;
          console.log("User is logged in (verified by user menu)");
          return true;
        } catch (e) {
          console.log(
            "User menu verification failed, trying alternative check"
          );
        }

        // محاولة بديلة للتحقق من التسجيل
        const alternativeCheck = await this.page.evaluate(() => {
          // التحقق من وجود رابط يحتوي على /users/ والذي يشير إلى صفحة المستخدم
          return !!document.querySelector('[href*="/users/"]');
        });

        if (alternativeCheck) {
          this.isLoggedIn = true;
          console.log("User is logged in (verified by user link)");
          return true;
        }
      }

      // إذا فشل التحقق، حاول التسجيل
      if (!this.isLoggedIn) {
        console.log("Not logged in, attempting to login...");
        return await this.loginToHaraj();
      }

      return true;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }

  // جلب الإعلانات الخاصة بالمستخدم
  async getMyAds() {
    try {
      if (!this.isLoggedIn) {
        await this.checkLoginStatus();
      }

      // الانتقال إلى صفحة المستخدم
      await this.page.goto(
        `https://haraj.com.sa/users/${process.env.HARAJ_NameAC}`,
        {
          waitUntil: "networkidle2",
          timeout: 30000,
        }
      );

      // الانتظار حتى تحميل الإعلانات
      await this.page.waitForSelector('[data-testid="post-item"]', {
        timeout: 10000,
      });

      // استخراج معلومات الإعلانات
      const ads = await this.page.evaluate(() => {
        const adElements = document.querySelectorAll(
          '[data-testid="post-item"]'
        );
        const adsData = [];

        adElements.forEach((ad) => {
          const titleElement = ad.querySelector(
            '[data-testid="post-title-link"]'
          );
          const priceElement = ad.querySelector(".text-text-title");
          const locationElement = ad.querySelector('[href*="/city/"]');
          const dateElement = ad.querySelector(".text-text-regular");
          const imageElement = ad.querySelector("img");

          const href = titleElement ? titleElement.getAttribute("href") : "";
          const adIdMatch = href.match(/\/(\d+)\//);
          const adId = adIdMatch ? adIdMatch[1] : "";

          adsData.push({
            adId,
            title: titleElement ? titleElement.textContent.trim() : "",
            price: priceElement ? priceElement.textContent.trim() : "",
            location: locationElement ? locationElement.textContent.trim() : "",
            date: dateElement ? dateElement.textContent.trim() : "",
            imageUrl: imageElement ? imageElement.src : "",
            link: titleElement ? `https://haraj.com.sa${href}` : "",
          });
        });

        return adsData;
      });

      console.log(`Found ${ads.length} ads`);
      return ads;
    } catch (error) {
      console.error("Error getting ads:", error);
      return [];
    }
  }

  async navigateToUserAds() {
    try {
      console.log("Navigating to user ads page...");

      // التحقق من وجود الصفحة وتهيئتها إذا لزم الأمر
      if (!this.page || this.page.isClosed()) {
        console.log("Page is not initialized or closed, reinitializing...");
      }

      const profileUrl = `https://haraj.com.sa/users/${encodeURIComponent(
        process.env.HARAJ_NameAC
      )}`;

      await this.page.goto(profileUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      await this.page.waitForSelector('[data-testid="post-item"]', {
        timeout: 15000,
      });

      console.log("Successfully navigated to user ads page");
      return true;
    } catch (error) {
      console.error("Error navigating to user ads:", error);
      return false;
    }
  }

  async extractAdsData() {
    try {
      console.log("Extracting ads data from Haraj...");

      if (!this.page || this.page.isClosed()) {
        console.log("Page is null or closed, reinitializing...");
        await this.ensureBotRunning();
      }

      return await this.getMyAds2();
    } catch (error) {
      console.error("Error extracting ads data:", error);
      return [];
    }
  }

  // bot.service.js - الجزء المحسن لاستخراج صور الإعلانات
  async getMyAds2() {
    try {
      console.log("Getting my ads from profile page...");

      // الانتقال إلى صفحة المستخدم
      if (!(await this.navigateToUserAds())) {
        throw new Error("Failed to navigate to user ads page");
      }

      // انتظار تحميل الإعلانات
      await this.page.waitForSelector('[data-testid="post-item"]', {
        timeout: 15000,
      });

      // استخراج بيانات الإعلانات من الصفحة الحالية فقط
      const ads = await this.page.evaluate(() => {
        const adElements = document.querySelectorAll(
          '[data-testid="post-item"]'
        );
        const adsData = [];

        adElements.forEach((ad) => {
          try {
            // استخراج رابط الإعلان ورقمه
            const linkElement = ad.querySelector(
              '[data-testid="post-title-link"]'
            );
            if (!linkElement) return;

            const href = linkElement.getAttribute("href");
            const adIdMatch = href.match(/\/(\d+)\//);
            if (!adIdMatch) return;

            const adId = adIdMatch[1];
            const fullLink = `https://haraj.com.sa${href}`;

            // استخراج العنوان
            const titleElement = linkElement.querySelector("h3");
            const title = titleElement ? titleElement.textContent.trim() : "";

            // استخراج السعر (من العناصر المختلفة)
            let price = "";
            const priceElements = ad.querySelectorAll(
              '.text-text-title, [class*="price"]'
            );
            for (const el of priceElements) {
              const text = el.textContent.trim();
              if (
                text.includes("ريال") ||
                text.includes("ر.س") ||
                /\d/.test(text)
              ) {
                price = text;
                break;
              }
            }

            // استخراج الموقع
            const locationElement = ad.querySelector('[href*="/city/"]');
            const location = locationElement
              ? locationElement.textContent.trim()
              : "";

            // استخراج التاريخ
            const dateElement = ad.querySelector(".text-text-regular");
            const date = dateElement ? dateElement.textContent.trim() : "";

            // استخراج الصورة الرئيسية للإعلان - التحديث الهام هنا
            // نبحث عن الصورة داخل العنصر الذي يحتوي على صورة الإعلان وليس صورة المستخدم
            let imageUrl = "";
            const imageContainer = ad.querySelector(
              'a[href*="/"][data-discover="true"]'
            );
            if (imageContainer) {
              const adImage = imageContainer.querySelector("img");
              if (adImage) {
                imageUrl = adImage.src;

                // تحسين جودة الصورة بإزالة الأحجام الصغيرة من الرابط
                if (imageUrl.includes("-140x140.")) {
                  imageUrl = imageUrl.replace("-140x140.", "-900x1316.");
                }
              }
            }

            // إذا لم نجد صورة الإعلان، نبحث عن أي صورة ليست صورة المستخدم
            if (!imageUrl) {
              const allImages = ad.querySelectorAll("img");
              for (const img of allImages) {
                // نتجنب الصور الدائرية (صور الملف الشخصي)
                const parent = img.closest("div");
                if (parent && !parent.classList.contains("rounded-full")) {
                  imageUrl = img.src;
                  break;
                }
              }
            }

            // استخراج عدد المشاهدات (إن وجد)
            let views = 0;
            const viewsElement = ad.querySelector('[data-icon="eye"]');
            if (viewsElement) {
              const viewsText = viewsElement.closest("div").textContent.trim();
              views = parseInt(viewsText.replace(/\D/g, "")) || 0;
            }

            // استخراج عدد التعليقات
            let commentsCount = 0;
            const commentsElement = ad.querySelector(
              '[data-icon="comments-alt"]'
            );
            if (commentsElement) {
              const countText = commentsElement
                .closest("div")
                .textContent.trim();
              commentsCount = parseInt(countText.replace(/\D/g, "")) || 0;
            }

            adsData.push({
              adId,
              title,
              price,
              location,
              date,
              imageUrl,
              link: fullLink,
              views,
              commentsCount,
              status: "active",
              hasImage: !!imageUrl,
              isPromoted: !!ad.querySelector('[class*="promoted"]'),
              extractedAt: new Date().toISOString(),
            });
          } catch (error) {
            console.error("Error processing ad:", error);
          }
        });

        return adsData;
      });

      console.log(`Found ${ads.length} ads on profile page`);
      return ads;
    } catch (error) {
      console.error("Error getting ads from profile:", error);
      return [];
    }
  }

  async navigateToAdPage(adId) {
    try {
      console.log(`Navigating to haraj ad page: ${adId}`);

      // الانتقال إلى صفحة الإعلان في حراج
      await this.page.goto(`https://haraj.com.sa/${adId}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل الصفحة - نستخدم عناصر حراج المحددة
      await this.page.waitForSelector('[data-testid="post-article"]', {
        timeout: 15000,
      });

      console.log("Successfully navigated to haraj ad page");
      return true;
    } catch (error) {
      console.error("Error navigating to haraj ad page:", error);
      throw error;
    }
  }

  async findUpdateButton() {
    try {
      console.log("Looking for update button in haraj...");

      // طرق مختلفة للعثور على زر التحديث في حراج
      const buttonSelectors = [
        // الطريقة 1: البحث بالنص في حراج
        'button:has-text("تحديث")',
        'button:has-text("تجديد")',
        '[data-testid="update-button"]',

        // الطريقة 2: البحث بالأيقونة
        'button:has(svg[data-icon*="sync"])',
        'button:has(svg[data-icon*="refresh"])',

        // الطريقة 3: البحث بالـ class المميز لحراج
        '[class*="update"] button',
        '[class*="refresh"] button',
        "button.text-text-regular", // قد يحتوي على زر التحديث
      ];

      let updateButton = null;

      for (const selector of buttonSelectors) {
        try {
          updateButton = await this.page.waitForSelector(selector, {
            timeout: 2000,
          });
          if (updateButton) break;
        } catch (e) {
          // continue trying next selector
        }
      }

      if (!updateButton) {
        // محاولة باستخدام XPath للنص
        const xpath = `//button[contains(text(), "تحديث") or contains(text(), "تجديد")]`;
        const buttons = await this.page.$x(xpath);
        if (buttons.length > 0) {
          updateButton = buttons[0];
        }
      }

      if (!updateButton) {
        // محاولة أخيرة: البحث في كل أزرار الصفحة
        const allButtons = await this.page.$$("button");
        for (const button of allButtons) {
          const text = await this.page.evaluate(
            (btn) => btn.textContent,
            button
          );
          if (text && (text.includes("تحديث") || text.includes("تجديد"))) {
            updateButton = button;
            break;
          }
        }
      }

      if (!updateButton) {
        throw new Error("زر التحديث غير موجود في صفحة حراج");
      }

      console.log("Update button found in haraj");
      return updateButton;
    } catch (error) {
      console.error("Error finding update button in haraj:", error);
      throw error;
    }
  }

  async checkUpdateAvailability(updateButton) {
    try {
      // التحقق مما إذا كان الزر معطلاً في حراج
      const isDisabled = await this.page.evaluate((button) => {
        return (
          button.disabled ||
          button.getAttribute("disabled") !== null ||
          button.classList.contains("disabled") ||
          button.style.opacity === "0.5" ||
          button.classList.contains("opacity-50")
        );
      }, updateButton);

      if (isDisabled) {
        throw new Error("زر التحديث غير متاح حالياً في حراج");
      }

      // التحقق من النص إذا كان يشير إلى عدم التمكن من التحديث
      const buttonText = await this.page.evaluate((button) => {
        return button.textContent;
      }, updateButton);

      const unavailableKeywords = [
        "غير متاح",
        "معلق",
        "متوقف",
        "لا يمكن",
        "غير مسموح",
      ];

      if (unavailableKeywords.some((keyword) => buttonText.includes(keyword))) {
        throw new Error("التحديث غير متاح حسب نص الزر في حراج");
      }

      return true;
    } catch (error) {
      console.error("Update not available in haraj:", error);
      throw error;
    }
  }

  async clickUpdateButton(updateButton) {
    try {
      // النقر على زر التحديث في حراج
      await updateButton.click();
      console.log("Clicked update button in haraj");

      // الانتظار لظهور نافذة التأكيد إذا كانت موجودة في حراج
      try {
        await this.page.waitForSelector(
          '.modal, .dialog, [role="dialog"], .popup',
          {
            timeout: 5000,
          }
        );

        // البحث عن زر التأكيد والنقر عليه في حراج
        const confirmSelectors = [
          'button:has-text("تأكيد")',
          'button:has-text("نعم")',
          'button:has-text("موافق")',
          'button:has-text("متابعة")',
          '[data-testid="confirm-button"]',
        ];

        let confirmButton = null;
        for (const selector of confirmSelectors) {
          try {
            confirmButton = await this.page.waitForSelector(selector, {
              timeout: 2000,
            });
            if (confirmButton) break;
          } catch (e) {
            // continue
          }
        }

        if (confirmButton) {
          await confirmButton.click();
          console.log("Clicked confirm button in haraj");
          await this.wait(2000);
        }
      } catch (modalError) {
        // إذا لم تظهر نافذة تأكيد، نستمر
        console.log("No confirmation modal appeared in haraj");
      }

      // انتظار اكتمال التحديث
      await this.wait(3000);

      return true;
    } catch (error) {
      console.error("Error clicking update button in haraj:", error);
      throw error;
    }
  }

  async verifyUpdateSuccess(adId) {
    // إضافة adId كمعامل
    try {
      // محاولة الانتظار حتى تظهر رسالة النجاح في حراج
      const maxRetries = 5;
      let successMessage = null;

      const successKeywords = [
        "تم التحديث",
        "تم بنجاح",
        "نجح التحديث",
        "تمت العملية",
        "success",
        "updated",
      ];

      for (let i = 0; i < maxRetries; i++) {
        successMessage = await this.page.evaluate((keywords) => {
          const elements = document.querySelectorAll("div, span, p, button");
          for (let el of elements) {
            const text = el.textContent.trim();
            if (keywords.some((keyword) => text.includes(keyword))) {
              return text;
            }
          }
          return null;
        }, successKeywords);

        if (successMessage) break;
        await this.wait(1000);
      }

      if (successMessage) {
        console.log(`Update successful in haraj: ${successMessage}`);
        return true;
      }

      // fallback: التحقق من أننا لا نزال في صفحة الإعلان
      const currentUrl = await this.page.url();
      if (currentUrl.includes(adId)) {
        // استخدام adId المعلمة
        console.log("Update completed successfully in haraj (fallback)");
        return true;
      }

      throw new Error("Unable to verify update success in haraj");
    } catch (error) {
      console.error("Error verifying update in haraj:", error);
      throw error;
    }
  }

  async updateAd(adId) {
    try {
      console.log(`Starting update process for haraj ad: ${adId}`);

      // التأكد من أن البوت يعمل
      await this.ensureBotRunning();

      // الانتقال إلى صفحة الإعلان في حراج
      await this.navigateToAdPage(adId);

      // البحث عن زر التحديث في حراج
      const updateButton = await this.findUpdateButton();

      // التحقق من توفر التحديث في حراج
      await this.checkUpdateAvailability(updateButton);

      // النقر على الزر في حراج
      await this.clickUpdateButton(updateButton);

      // التحقق من النجاح في حراج - تمرير adId
      const success = await this.verifyUpdateSuccess(adId);

      if (success) {
        console.log(`Haraj ad ${adId} updated successfully`);
        return {
          success: true,
          message: "تم تحديث الإعلان في حراج بنجاح",
          adId,
          timestamp: new Date().toISOString(),
        };
      }

      throw new Error("Update completed but verification failed in haraj");
    } catch (error) {
      console.error(`Failed to update haraj ad ${adId}:`, error);

      // محاولة التقاط screenshot للتصحيح
      try {
        await this.page.screenshot({
          path: `error-${adId}-${Date.now()}.png`,
          fullPage: true,
        });
        console.log("Screenshot saved for debugging");
      } catch (screenshotError) {
        console.error("Failed to take screenshot:", screenshotError);
      }

      throw new Error(`فشل في تحديث الإعلان في حراج: ${error.message}`);
    }
  }

  async updateAllAds() {
    try {
      console.log("Starting to update all ads...");

      // جلب جميع الإعلانات
      const ads = await this.getMyAds2();

      if (ads.length === 0) {
        console.log("No ads found to update");
        return { success: true, updated: 0, total: 0 };
      }

      console.log(`Found ${ads.length} ads to process`);

      let successfulUpdates = 0;
      const results = [];

      // تحديث كل إعلان على حدة
      for (const ad of ads) {
        try {
          console.log(`Processing ad: ${ad.adId} - ${ad.title}`);

          const result = await this.updateAd(ad.adId);

          if (result.success) {
            successfulUpdates++;
            results.push({
              adId: ad.adId,
              status: "success",
              message: result.message,
            });

            // انتظار عشوائي بين الإعلانات (30-120 ثانية)
            const randomWait = Math.floor(Math.random() * 90000) + 30000;
            console.log(
              `Waiting ${randomWait / 1000} seconds before next ad...`
            );
            await this.wait(randomWait);
          } else {
            results.push({
              adId: ad.adId,
              status: "failed",
              message: result.message,
            });
          }
        } catch (error) {
          console.error(`Error updating ad ${ad.adId}:`, error);
          results.push({
            adId: ad.adId,
            status: "error",
            message: error.message,
          });
        }
      }

      console.log(
        `Update process completed. Successful: ${successfulUpdates}/${ads.length}`
      );

      return {
        success: true,
        updated: successfulUpdates,
        total: ads.length,
        results: results,
      };
    } catch (error) {
      console.error("Error in updateAllAds:", error);
      throw error;
    }
  }

  async scheduleRandomUpdates() {
    try {
      // حساب وقت عشوائي بين 20-48 ساعة
      const randomHours = Math.floor(Math.random() * 29) + 20;
      const randomMs = randomHours * 60 * 60 * 1000;

      console.log(
        `Scheduling next update in ${randomHours} hours (${randomMs}ms)`
      );

      // إلغاء أي جدولة سابقة
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }

      // جدولة التحديث التالي
      this.updateTimeout = setTimeout(async () => {
        try {
          console.log("Auto-update triggered by scheduler");
          await this.updateAllAds();

          // جدولة التحديث التالي بعد الانتهاء
          await this.scheduleRandomUpdates();
        } catch (error) {
          console.error("Error in scheduled update:", error);
          // إعادة الجدولة في حالة الخطأ (بعد ساعة)
          setTimeout(() => this.scheduleRandomUpdates(), 60 * 60 * 1000);
        }
      }, randomMs);

      return {
        success: true,
        nextUpdate: new Date(Date.now() + randomMs),
        hours: randomHours,
      };
    } catch (error) {
      console.error("Error scheduling updates:", error);
      throw error;
    }
  }

  // بدء نظام التحديث التلقائي
  async startAutoUpdate() {
    try {
      console.log("Starting auto-update system...");

      // التأكد من أن البوت يعمل
      await this.ensureBotRunning();

      // بدء الجدولة
      const scheduleResult = await this.scheduleRandomUpdates();

      console.log("Auto-update system started successfully");
      return scheduleResult;
    } catch (error) {
      console.error("Failed to start auto-update system:", error);
      throw error;
    }
  }

  // إيقاف نظام التحديث التلقائي
  stopAutoUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
      console.log("Auto-update system stopped");
    }

    return { success: true, message: "Auto-update stopped" };
  }

  // الحصول على حالة النظام
  getSchedulerStatus() {
    if (this.updateTimeout) {
      const nextUpdate = new Date(Date.now() + this.updateTimeout._idleTimeout);
      return {
        isRunning: true,
        nextUpdate: nextUpdate,
        timeoutMs: this.updateTimeout._idleTimeout,
      };
    }

    return { isRunning: false };
  }

  async navigateToMessages() {
    try {
      console.log("Navigating to Haraj messages...");

      await this.page.goto("https://haraj.com.sa/chat", {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // انتظار تحميل قائمة المحادثات
      await this.page.waitForSelector(
        ".group.relative.max-w-full.overflow-hidden",
        {
          timeout: 30000,
        }
      );

      console.log("Successfully navigated to Haraj messages");
      return true;
    } catch (error) {
      console.error("Error navigating to Haraj messages:", error);
      throw error;
    }
  }

  async checkForNewMessages() {
    try {
      // التحقق من وجود إشعار بالرسائل الجديدة في النافبار
      const hasNewMessages = await this.page.evaluate(() => {
        const chatLink = document.querySelector('[data-testid="chat-link"]');
        if (!chatLink) return false;

        // البحث عن عنصر العداد الأحمر
        const badge = chatLink.querySelector(
          '.absolute.bg-red-500, .bg-red-600, [class*="bg-red"]'
        );
        return badge !== null;
      });

      return hasNewMessages;
    } catch (error) {
      console.error("Error checking for new messages:", error);
      return false;
    }
  }

  async extractMessages() {
    try {
      console.log("Extracting messages from Haraj...");

      const messages = await this.page.evaluate(() => {
        const messageElements = document.querySelectorAll(
          ".group.relative.max-w-full.overflow-hidden"
        );
        const messagesData = [];

        messageElements.forEach((messageEl, index) => {
          try {
            // استخراج اسم المرسل
            const senderElement = messageEl.querySelector("h2 a");
            const senderName = senderElement
              ? senderElement.textContent.trim()
              : "Unknown";

            // استخراج اسم المستخدم من الرابط
            const senderLink = senderElement
              ? senderElement.getAttribute("href")
              : "";
            const usernameMatch = senderLink.match(/\/users\/(.+)/);
            const senderUsername = usernameMatch ? usernameMatch[1] : "";

            // استخراج محتوى الرسالة
            const contentElement = messageEl.querySelector(".break-all");
            const messageContent = contentElement
              ? contentElement.textContent.trim()
              : "";

            // استخراج الوقت
            const timeElement = messageEl.querySelector("time");
            const receivedTime = timeElement
              ? timeElement.textContent.trim()
              : "";

            // التحقق من إذا كانت الرسالة جديدة (غير مقروءة)
            const isUnread = messageEl.querySelector(
              ".bg-\\[var\\(--color-active-filter-button-bg\\)\\]"
            )
              ? false
              : true;

            // استخراج الصورة الرمزية
            const avatarElement = messageEl.querySelector("svg text");
            const avatarInitial = avatarElement
              ? avatarElement.textContent.trim()
              : "";

            messagesData.push({
              messageId: `haraj-msg-${index}-${Date.now()}`,
              senderName,
              senderUsername,
              messageContent,
              receivedTime,
              isUnread,
              avatarInitial,
              extractedAt: new Date().toISOString(),
            });
          } catch (error) {
            console.error("Error extracting message:", error);
          }
        });

        return messagesData;
      });

      console.log(`Extracted ${messages.length} messages from Haraj`);
      return messages;
    } catch (error) {
      console.error("Error extracting Haraj messages:", error);
      throw error;
    }
  }

  async openConversation(username) {
    try {
      console.log(`Opening conversation with: ${username}`);

      // البحث عن المحادثة باستخدام اسم المستخدم
      const conversationSelector = `a[href="/users/${username}"]`;

      await this.page.waitForSelector(conversationSelector, { timeout: 10000 });
      await this.page.click(conversationSelector);

      // انتظار تحميل صفحة المحادثة
      await this.page.waitForSelector("#chat-textbox", { timeout: 15000 });

      // التحقق من أننا في الصفحة الصحيحة
      const currentUrl = this.page.url();
      if (!currentUrl.includes("/chat/")) {
        throw new Error("Failed to open conversation page");
      }

      console.log("Conversation opened successfully");
      return true;
    } catch (error) {
      console.error("Error opening conversation:", error);
      throw error;
    }
  }

  async sendReply(messageContent) {
    try {
      console.log("Sending reply...");

      // البحث عن حقل إدخال الرسالة
      const messageInput = await this.page.$("#chat-textbox");
      if (!messageInput) {
        throw new Error("Message input field not found");
      }

      // التركيز على حقل الإدخال
      await messageInput.click();
      await this.wait(1000);

      // مسح الحقل إذا كان هناك نص
      await messageInput.click({ clickCount: 3 });
      await this.page.keyboard.press("Backspace");
      await this.wait(500);

      // كتابة الرسالة
      await messageInput.type(messageContent, { delay: 30 });
      await this.wait(1000);

      // إرسال الرسالة باستخدام Enter
      await this.page.keyboard.press("Enter");

      // الانتظار حتى يتم الإرسال
      await this.wait(3000);

      console.log("Reply sent successfully");
      return true;
    } catch (error) {
      console.error("Error sending reply:", error);
      throw error;
    }
  }

  async selectReplyTemplate(message) {
    // قوالب الردود المحسنة لحراج
    const templates = {
      greeting:
        "السلام عليكم ورحمة الله وبركاته 🌹\nأهلاً وسهلاً، كيف يمكنني مساعدتك؟",
      price:
        "وعليكم السلام ورحمة الله 🌹\nالسعر المذكور في الإعلان. هل ترغب في التفاوض؟",
      availability:
        "أهلاً بك 🌹\nنعم، الإعلان لا يزال متاح. هل ترغب في المعاينة؟",
      location:
        "وعليكم السلام 🌹\nالمكان موضح في الخريطة في الإعلان. هل تحتاج إلى اتجاهات محددة؟",
      contact:
        "أهلاً وسهلاً 🌹\nيمكنك التواصل معي على الرقم الموجود في الإعلان للتفاصيل.",
      default: "السلام عليكم 🌹\nشكراً لاهتمامك بالإعلان. كيف يمكنني مساعدتك؟",
    };

    const content = message.messageContent.toLowerCase();

    if (
      content.includes("سعر") ||
      content.includes("ثمن") ||
      content.includes("كم")
    ) {
      return templates.price;
    } else if (
      content.includes("متاح") ||
      content.includes("موجود") ||
      content.includes("لازال")
    ) {
      return templates.availability;
    } else if (
      content.includes("مكان") ||
      content.includes("موقع") ||
      content.includes("عنوان")
    ) {
      return templates.location;
    } else if (
      content.includes("رقم") ||
      content.includes("اتصال") ||
      content.includes("تواصل")
    ) {
      return templates.contact;
    } else if (
      content.includes("السلام") ||
      content.includes("مرحب") ||
      content.includes("اهلا")
    ) {
      return templates.greeting;
    } else {
      return templates.default;
    }
  }

  async processMessages(adId = null, userId = null) {
    try {
      console.log(`Processing Haraj messages${adId ? " for ad: " + adId : ""}`);

      if (!this.page) {
        throw new Error("الصفحة غير مفتوحة، الرجاء تشغيل الروبوت أولاً");
      }

      // الانتقال إلى رسائل حراج
      await this.navigateToMessages();

      // التحقق من وجود رسائل جديدة
      const hasNewMessages = await this.checkForNewMessages();
      if (!hasNewMessages) {
        console.log("No new messages found");
        return { processed: 0, success: 0, failed: 0, details: [] };
      }

      // استخراج الرسائل
      const messages = await this.extractMessages();
      const unreadMessages = messages.filter((msg) => msg.isUnread);

      console.log(`Found ${unreadMessages.length} unread messages`);

      const results = [];

      for (const message of unreadMessages) {
        try {
          console.log(`Processing message from: ${message.senderName}`);

          // فتح المحادثة
          await this.openConversation(message.senderUsername);

          // اختيار الرد المناسب
          const replyContent = await this.selectReplyTemplate(message);

          // إرسال الرد
          await this.sendReply(replyContent);

          // حفظ في قاعدة البيانات
          const savedMessage = await this.saveMessageToDatabase({
            ...message,
            userId,
            adId: adId || "general",
            replyContent,
          });

          results.push({
            success: true,
            messageId: message.messageId,
            sender: message.senderName,
            replyContent,
            savedMessageId: savedMessage._id,
          });

          // العودة إلى قائمة الرسائل
          await this.navigateToMessages();
          await this.wait(2000);
        } catch (error) {
          console.error(
            `Failed to process message from ${message.senderName}:`,
            error
          );
          results.push({
            success: false,
            messageId: message.messageId,
            sender: message.senderName,
            error: error.message,
          });

          // محاولة العودة إلى القائمة الرئيسية في حالة الخطأ
          try {
            await this.navigateToMessages();
          } catch (e) {
            console.error("Failed to navigate back to messages:", e);
          }
        }
      }

      return {
        processed: unreadMessages.length,
        success: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        details: results,
      };
    } catch (error) {
      console.error("Error processing messages:", error);
      throw error;
    }
  }

  async saveMessageToDatabase(messageData) {
    try {
      const Message = await import("../messages/msg.model.js").default;

      const message = new Message({
        messageId: messageData.messageId,
        senderName: messageData.senderName,
        senderUsername: messageData.senderUsername,
        adId: messageData.adId,
        adTitle: messageData.adTitle || "Unknown",
        messageContent: messageData.messageContent,
        receivedDate: new Date(),
        status: "replied",
        replyContent: messageData.replyContent,
        repliedAt: new Date(),
        conversationId: messageData.conversationId,
        metadata: {
          isUnread: messageData.isUnread,
          messageType: this.determineMessageType(messageData.messageContent),
          responseTime: Math.floor(
            (new Date() - new Date(messageData.extractedAt)) / 1000
          ),
        },
        userId: messageData.userId,
      });

      const savedMessage = await message.save();
      console.log(`Message saved to database: ${savedMessage._id}`);
      return savedMessage;
    } catch (error) {
      console.error("Error saving message to database:", error);
      throw error;
    }
  }

  determineMessageType(messageContent) {
    const content = messageContent.toLowerCase();

    if (content.includes("سعر") || content.includes("ثمن")) {
      return "price_inquiry";
    } else if (content.includes("متاح") || content.includes("موجود")) {
      return "availability";
    } else if (content.includes("مكان") || content.includes("موقع")) {
      return "location";
    } else if (content.includes("رقم") || content.includes("اتصال")) {
      return "contact_request";
    } else if (content.includes("السلام") || content.includes("مرحب")) {
      return "greeting";
    } else {
      return "general_inquiry";
    }
  }

  async stop() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        this.isLoggedIn = false;
      }
      return { success: true, message: "Bot stopped successfully" };
    } catch (error) {
      console.error("Error stopping bot:", error);
      throw error;
    }
  }
}

export default new botService();
