import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    subTitle: {type: String},
    description: {type: String, required: true},
    category: { type: String, required: true },
  image: { type: String, required: true },
  imageFileId: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
}, {timestamps: true});

const Blog = mongoose.model('blog', blogSchema);

export default Blog;