import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderUsername: {
    type: String,
    default: ''
  },
  adId: {
    type: String,
    required: true
  },
  adTitle: {
    type: String,
    required: true
  },
  messageContent: {
    type: String,
    default: ''
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'replied', 'read', 'archived'],
    default: 'new'
  },
  replyContent: {
    type: String,
    default: ''
  },
  repliedAt: {
    type: Date
  },
  conversationId: {
    type: String,
    default: ''
  },
  metadata: {
    isUnread: Boolean,
    messageType: String,
    responseTime: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// فهارس للبحث السريع
messageSchema.index({ messageId: 1, userId: 1 });
messageSchema.index({ status: 1, receivedDate: 1 });
messageSchema.index({ adId: 1, userId: 1 });
messageSchema.index({ conversationId: 1 });

export default mongoose.model('Message', messageSchema);