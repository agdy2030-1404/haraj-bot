import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import harajService from '../../services/message.service';

// جلب رسائل الحراج
export const fetchHarajMessages = createAsyncThunk(
  'message/fetchMessages',
  async ({ status, page, limit }, { rejectWithValue }) => {
    try {
      const response = await harajService.getMessages(status, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب رسائل الحراج');
    }
  }
);

// معالجة رسائل الحراج
export const processHarajMessages = createAsyncThunk(
  'message/processMessages',
  async (adId = null, { rejectWithValue }) => {
    try {
      const response = await harajService.processMessages(adId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في معالجة رسائل الحراج');
    }
  }
);

// جلب قوالب الحراج
export const fetchHarajTemplates = createAsyncThunk(
  'message/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await harajService.getTemplates();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب قوالب الحراج');
    }
  }
);

// إنشاء قالب حراج جديد
export const createHarajTemplate = createAsyncThunk(
  'message/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await harajService.createTemplate(templateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء قالب الحراج');
    }
  }
);

// جلب إعلانات الحراج
export const fetchHarajAds = createAsyncThunk(
  'message/fetchAds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await harajService.getUserAds();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب إعلانات الحراج');
    }
  }
);

export const updateHarajTemplate = createAsyncThunk(
  'message/updateTemplate',
  async ({ templateId, templateData }, { rejectWithValue }) => {
    try {
      const response = await harajService.updateTemplate(templateId, templateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحديث قالب الحراج');
    }
  }
);

// حذف قالب الحراج
export const deleteHarajTemplate = createAsyncThunk(
  'message/deleteTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      const response = await harajService.deleteTemplate(templateId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في حذف قالب الحراج');
    }
  }
);

const harajSlice = createSlice({
  name: 'haraj',
  initialState: {
    messages: [],
    templates: [],
    ads: [],
    loading: false,
    processing: false,
    error: null,
    lastFetch: null,
    lastProcess: null
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
    }
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

      // القوالب
      .addCase(fetchHarajTemplates.fulfilled, (state, action) => {
        state.templates = action.payload.data || [];
      })
      .addCase(createHarajTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload.data);
      })

      // الإعلانات
      .addCase(fetchHarajAds.fulfilled, (state, action) => {
        state.ads = action.payload.data || [];
      })
            .addCase(updateHarajTemplate.fulfilled, (state, action) => {
        const updatedTemplate = action.payload.data;
        const index = state.templates.findIndex(t => t._id === updatedTemplate._id);
        if (index !== -1) {
          state.templates[index] = updatedTemplate;
        }
      })

      // حذف القالب
      .addCase(deleteHarajTemplate.fulfilled, (state, action) => {
        const templateId = action.payload.data.id;
        state.templates = state.templates.filter(t => t._id !== templateId);
      });
  }
});

export const { clearHarajError, resetHarajState } = harajSlice.actions;
export default harajSlice.reducer;