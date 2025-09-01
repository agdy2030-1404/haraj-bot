import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// خدمة الحراج الرئيسية
const harajService = {
  // جلب رسائل الحراج
  getMessages: async (status = "", page = 1, limit = 20) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page);
    params.append("limit", limit);

    const res = await axios.get(`${API_URL}/api/message?${params.toString()}`, {
      withCredentials: true,
    });
    return res.data;
  },

  // معالجة رسائل الحراج
  processMessages: async (adId = null) => {
    let url = `${API_URL}/api/message/process`;
    if (adId) {
      url = `${API_URL}/api/message/process/${adId}`;
    }

    const res = await axios.post(url, {}, { withCredentials: true });
    return res.data;
  },

  // جلب قوالب الحراج
  getTemplates: async () => {
    const res = await axios.get(`${API_URL}/api/message/templates`, {
      withCredentials: true,
    });
    return res.data;
  },

  // إنشاء قالب جديد للحراج
  createTemplate: async (templateData) => {
    const res = await axios.post(`${API_URL}/api/message/templates`, templateData, {
      withCredentials: true,
    });
    return res.data;
  },

  // جلب إعلانات المستخدم من الحراج
  getUserAds: async () => {
    const res = await axios.get(`${API_URL}/api/message/ads`, {
      withCredentials: true,
    });
    return res.data;
  },

   updateTemplate: async (templateId, templateData) => {
    const res = await axios.put(
      `${API_URL}/api/message/templates/${templateId}`,
      templateData,
      { withCredentials: true }
    );
    return res.data;
  },

  // حذف قالب الحراج
  deleteTemplate: async (templateId) => {
    const res = await axios.delete(
      `${API_URL}/api/message/templates/${templateId}`,
      { withCredentials: true }
    );
    return res.data;
  },
};



export default harajService;