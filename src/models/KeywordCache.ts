import mongoose from 'mongoose';

const keywordCacheSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    unique: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const KeywordCache = mongoose.models.KeywordCache || mongoose.model('KeywordCache', keywordCacheSchema);

export default KeywordCache; 