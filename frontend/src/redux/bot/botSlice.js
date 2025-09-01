// botSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { botService } from "../../services/bot.service";

// Async Thunks
export const getBotStatus = createAsyncThunk(
  "bot/getStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.getStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في جلب حالة روبوت حراج"
      );
    }
  }
);

export const startBot = createAsyncThunk(
  "bot/start",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.start();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في تشغيل روبوت حراج"
      );
    }
  }
);

export const stopBot = createAsyncThunk(
  "bot/stop",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.stop();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في إيقاف روبوت حراج"
      );
    }
  }
);

export const fetchAds = createAsyncThunk(
  "ads/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.fetchAds();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في جلب إعلانات حراج"
      );
    }
  }
);

// botSlice.js - إضافة الـ thunks الجديدة
export const startAutoUpdate = createAsyncThunk(
  "bot/startAutoUpdate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.startAutoUpdate();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في بدء التحديث التلقائي"
      );
    }
  }
);

export const stopAutoUpdate = createAsyncThunk(
  "bot/stopAutoUpdate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.stopAutoUpdate();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في إيقاف التحديث التلقائي"
      );
    }
  }
);

export const getSchedulerStatus = createAsyncThunk(
  "bot/getSchedulerStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.getSchedulerStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في جلب حالة المجدول"
      );
    }
  }
);

export const updateAllAds = createAsyncThunk(
  "bot/updateAllAds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.updateAllAds();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في تحديث جميع الإعلانات"
      );
    }
  }
);

const botSlice = createSlice({
  name: "bot",
  initialState: {
    isRunning: false,
    isLoggedIn: false,
    loading: false,
    error: null,
    lastUpdate: null,

    // حالة التحديث التلقائي
    autoUpdate: {
      isRunning: false,
      nextUpdate: null,
    },

    // الإعلانات
    ads: [],
    adsLoading: false,
    adsError: null,
    selectedAd: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.adsError = null;
    },
    setStatus: (state, action) => {
      state.isRunning = action.payload.isRunning;
      state.isLoggedIn = action.payload.isLoggedIn;
    },
    selectAd: (state, action) => {
      state.selectedAd = action.payload;
    },
    clearAdsError: (state) => {
      state.adsError = null;
    },
    clearAds: (state) => {
      state.ads = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBotStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBotStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isRunning = action.payload.isRunning;
        state.isLoggedIn = action.payload.isLoggedIn;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(getBotStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(startBot.pending, (state) => {
        state.loading = true;
      })
      .addCase(startBot.fulfilled, (state, action) => {
        state.loading = false;
        state.isRunning = true;
        state.isLoggedIn = action.payload.isLoggedIn;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(startBot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(stopBot.pending, (state) => {
        state.loading = true;
      })
      .addCase(stopBot.fulfilled, (state) => {
        state.loading = false;
        state.isRunning = false;
        state.isLoggedIn = false;
        state.lastUpdate = new Date().toISOString();
        state.ads = [];
      })
      .addCase(stopBot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAds.pending, (state) => {
        state.adsLoading = true;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.adsLoading = false;
        state.ads = action.payload.data || action.payload;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.adsLoading = false;
        state.adsError = action.payload;
      })
      .addCase(startAutoUpdate.pending, (state) => {
        state.loading = true;
      })
      .addCase(startAutoUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.autoUpdate = {
          isRunning: true,
          nextUpdate: action.payload.nextUpdate,
        };
      })
      .addCase(startAutoUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // stopAutoUpdate
      .addCase(stopAutoUpdate.pending, (state) => {
        state.loading = true;
      })
      .addCase(stopAutoUpdate.fulfilled, (state) => {
        state.loading = false;
        state.autoUpdate = {
          isRunning: false,
          nextUpdate: null,
        };
      })
      .addCase(stopAutoUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getSchedulerStatus
      .addCase(getSchedulerStatus.fulfilled, (state, action) => {
        state.autoUpdate = action.payload;
      })

      // updateAllAds
      .addCase(updateAllAds.pending, (state) => {
        state.adsLoading = true;
      })
      .addCase(updateAllAds.fulfilled, (state, action) => {
        state.adsLoading = false;
        // يمكنك تحديث حالة الإعلانات هنا إذا لزم الأمر
      })
      .addCase(updateAllAds.rejected, (state, action) => {
        state.adsLoading = false;
        state.adsError = action.payload;
      });
  },
});

export const { clearError, setStatus, selectAd, clearAdsError, clearAds } =
  botSlice.actions;
export default botSlice.reducer;
