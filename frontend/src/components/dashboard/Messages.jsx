'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchHarajMessages, 
  processHarajMessages, 
  fetchHarajAds,
  clearHarajError 
} from '@/redux/messages/messageSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HarajMessages = () => {
  const dispatch = useDispatch();
  const { messages, loading, processing, error, ads } = useSelector((state) => state.messages);
  const [selectedAdId, setSelectedAdId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchHarajMessages({ status: statusFilter, page: 1, limit: 20 }));
    dispatch(fetchHarajAds());
  }, [dispatch, statusFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        rtl: true,
      });
      dispatch(clearHarajError());
    }
  }, [error, dispatch]);

  const handleProcess = () => {
    const adId = selectedAdId === 'all' ? null : selectedAdId;
    dispatch(processHarajMessages(adId)).then((result) => {
      if (!result.error) {
        dispatch(fetchHarajMessages({ status: statusFilter, page: 1, limit: 20 }));
        toast.success('تم معالجة رسائل الحراج بنجاح!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          rtl: true,
        });
      }
    });
  };

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: 'new', label: 'جديد' },
    { value: 'replied', label: 'تم الرد' },
    { value: 'read', label: 'مقروء' },
    { value: 'archived', label: 'مؤرشف' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-bold">إدارة رسائل الحراج</h2>
                <p className="text-cyan-200 mt-1">عرض وإدارة جميع رسائل حراج</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold">منصة حراج</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Filters and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">حالة الرسالة</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الإعلان</label>
                <select
                  value={selectedAdId}
                  onChange={(e) => setSelectedAdId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">جميع الإعلانات</option>
                  {ads.map((ad) => (
                    <option key={ad.adId} value={ad.adId}>
                      {ad.title} - {ad.adId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      تشغيل الرد التلقائي
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">إجمالي الرسائل</p>
                    <p className="text-2xl font-bold text-blue-800">{messages.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">تم الرد</p>
                    <p className="text-2xl font-bold text-green-800">
                      {messages.filter(m => m.status === 'replied').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">جديد</p>
                    <p className="text-2xl font-bold text-amber-800">
                      {messages.filter(m => m.status === 'new').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">الإعلانات</p>
                    <p className="text-2xl font-bold text-purple-800">{ads.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <p className="mt-4 text-gray-500 text-lg">لا توجد رسائل لعرضها</p>
                    <p className="text-gray-400">سيتم عرض الرسائل هنا عند توفرها</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
                      <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2">
                        <div className="flex items-center">
                          <div className={`rounded-full p-2 mr-3 ${
                            msg.status === 'new' ? 'bg-amber-100 text-amber-800' :
                            msg.status === 'replied' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-1.003-.21-1.96-.59-2.808A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">{msg.senderName}</span>
                            {msg.senderUsername && (
                              <span className="text-sm text-gray-500 mr-2">@{msg.senderUsername}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 bg-gray-100 py-1 px-3 rounded-full">
                            {new Date(msg.receivedDate).toLocaleString('ar-SA')}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            msg.status === 'new' ? 'bg-amber-100 text-amber-800' :
                            msg.status === 'replied' ? 'bg-green-100 text-green-800' :
                            msg.status === 'read' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {msg.status === 'new' ? 'جديد' :
                             msg.status === 'replied' ? 'تم الرد' :
                             msg.status === 'read' ? 'مقروء' : 'مؤرشف'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <p className="text-gray-700">{msg.messageContent}</p>
                      </div>
                      
                      {msg.replyContent && (
                        <div className="mt-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-green-100 text-green-800 rounded-full p-2 mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-green-700 font-medium">تم الرد:</span>
                              <p className="text-green-800 mt-1">{msg.replyContent}</p>
                              {msg.repliedAt && (
                                <p className="text-green-600 text-sm mt-1">
                                  {new Date(msg.repliedAt).toLocaleString('ar-SA')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.adTitle && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">الإعلان:</span> {msg.adTitle}
                          </p>
                          {msg.adId && (
                            <p className="text-xs text-blue-600">ID: {msg.adId}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default HarajMessages;