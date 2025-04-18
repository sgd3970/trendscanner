import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String // bcrypt 해시 저장
});

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema); 