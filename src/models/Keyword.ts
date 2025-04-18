import mongoose from 'mongoose';

const KeywordSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  used: { type: Boolean, default: false },
  usedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Keyword || mongoose.model('Keyword', KeywordSchema); 