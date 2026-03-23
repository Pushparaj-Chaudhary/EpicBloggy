import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    blog: {type: mongoose.Schema.Types.ObjectId, ref: 'blog', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: {type: String, required: true},
    status: {type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
}, {timestamps: true});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;