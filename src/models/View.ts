import mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// IP와 User-Agent로 중복 조회수 방지
viewSchema.index({ postId: 1, ip: 1, userAgent: 1 }, { unique: true });

const View = mongoose.models.View || mongoose.model('View', viewSchema);

export default View; 