import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import harajService from "../../services/message.service";

// جلب رسائل الحراج
export const fetchHarajMessages = createAsyncThunk(
  "message/fetchMessages",
  async ({ status, page, limit }, { rejectWithValue }) => {
    try {
      const response = await harajService.getMessages(status, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في جلب رسائل الحراج"
      );
    }
  }
);

// معالجة رسائل الحراج
export const processHarajMessages = createAsyncThunk(
  "message/processMessages",
  async (adId = null, { rejectWithValue }) => {
    try {
      const response = await harajService.processMessages(adId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في معالجة رسائل الحراج"
      );
    }
  }
);

// جلب إعلانات الحراج
export const fetchHarajAds = createAsyncThunk(
  "message/fetchAds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await harajService.getUserAds();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في جلب إعلانات الحراج"
      );
    }
  }
);

export const updateUnifiedMessage = createAsyncThunk(
  "message/updateUnifiedMessage",
  async (messageContent, { rejectWithValue }) => {
    try {
      const response = await harajService.updateUnifiedMessage(messageContent);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في تحديث الرسالة الموحدة"
      );
    }
  }
);

const harajSlice = createSlice({
  name: "haraj",
  initialState: {
    messages: [],
    ads: [],
    unifiedMessage:
      "السلام عليكم ورحمة الله يعطيكم العافية لاهنتوا رقم الوسيط في الإعلان أرجو التواصل معاه ولكم جزيل الشكر والتقدير-إدارة منصة صانع العقود للخدمات العقارية",
    loading: false,
    processing: false,
    error: null,
    lastFetch: null,
    lastProcess: null,
  },
  reducers: {
    clearHarajError: (state) => {
      state.error = null;
    },
    resetHarajState: (state) => {
      state.messages = [];
      state.templates = [];
      state.ads = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // جلب الرسائل
      .addCase(fetchHarajMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHarajMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.data || [];
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchHarajMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // معالجة الرسائل
      .addCase(processHarajMessages.pending, (state) => {
        state.processing = true;
      })
      .addCase(processHarajMessages.fulfilled, (state, action) => {
        state.processing = false;
        state.lastProcess = new Date().toISOString();
      })
      .addCase(processHarajMessages.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })

      // تحديث الرسالة الموحدة
      .addCase(updateUnifiedMessage.fulfilled, (state, action) => {
        state.unifiedMessage =
          action.payload.data?.message || action.payload.data;
      })

      // الإعلانات
      .addCase(fetchHarajAds.fulfilled, (state, action) => {
        state.ads = action.payload.data || [];
      });
  },
});

export const { clearHarajError, resetHarajState } = harajSlice.actions;
export default harajSlice.reducer;
