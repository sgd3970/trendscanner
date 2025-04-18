import mongoose from 'mongoose';

const PostLogSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  action: { type: String, required: true }, // 예: 'created', 'updated', 'deleted'
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 로그를 생성한 사용자
  details: { type: String } // 추가적인 로그 정보
});

export default mongoose.models.PostLog || mongoose.model('PostLog', PostLogSchema); 