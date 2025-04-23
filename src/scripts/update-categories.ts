import mongoose from 'mongoose';
import Post from '../models/Post';

async function updateCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    
    const result = await Post.updateMany(
      { category: { $exists: false } },
      { $set: { category: 'trend' } }
    );

    console.log(`Updated ${result.modifiedCount} posts to have 'trend' category`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
}

updateCategories(); 