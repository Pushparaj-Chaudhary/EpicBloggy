import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cache from '../utils/cache.js';

export const adminLogin = async (req, res) => {
    // We can keep this for backward compatibility if the frontend relies on /api/admin/login
    // But route it through the regular User model checking for 'admin' role
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && user.role === 'admin' && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
            res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
        } else {
            res.json({ success: false, message: "Invalid Admin Credentials" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getAllBlogsAdmin = async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find({})
            .populate({ path: "blog", select: "title", options: { strictPopulate: false } })
            .populate({ path: "user", select: "name email", options: { strictPopulate: false } })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, comments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getDashboard = async (req, res) => {
    try {
        const recentBlogs = await Blog.find({})
            .populate({ path: 'author', select: 'name email', options: { strictPopulate: false } })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        const blogs = await Blog.countDocuments();
        const comments = await Comment.countDocuments();
        const pendingBlogs = await Blog.countDocuments({ status: 'pending' });
        const pendingComments = await Comment.countDocuments({ status: 'pending' });

        const dashboardData = {
            blogs, comments, pendingBlogs, pendingComments, recentBlogs
        }
        res.json({ success: true, dashboardData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const deleteCommentById = async (req, res) => {
    try {
        const { id } = req.body;
        await Comment.findByIdAndDelete(id);
        res.json({ success: true, message: "comments deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const updateCommentStatus = async (req, res) => {
    try {
        const { id, status } = req.body; // status: 'approved' or 'rejected'
        await Comment.findByIdAndUpdate(id, { status });
        res.json({ success: true, message: `Comment ${status} successfully` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const updateBlogStatus = async (req, res) => {
    try {
        const { id, status } = req.body; // status: 'approved' or 'rejected'
        await Blog.findByIdAndUpdate(id, { status });
        cache.flushAll();
        res.json({ success: true, message: `Blog ${status} successfully` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}