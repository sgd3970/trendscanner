import mongoose from 'mongoose';

const keywordSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  used: { type: Boolean, default: false },
  usedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Keyword || mongoose.model('Keyword', keywordSchema); 