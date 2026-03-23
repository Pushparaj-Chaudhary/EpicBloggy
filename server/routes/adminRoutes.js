import express from 'express';
import { adminLogin, updateCommentStatus, deleteCommentById, getAllBlogsAdmin, getAllComments, getDashboard, updateBlogStatus } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminProtect } from '../middleware/adminMiddleware.js';

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/comments", protect, adminProtect, getAllComments);
adminRouter.get("/blogs", protect, adminProtect, getAllBlogsAdmin);
adminRouter.post("/delete-comment", protect, adminProtect, deleteCommentById);
adminRouter.post("/update-comment-status", protect, adminProtect, updateCommentStatus);
adminRouter.post("/update-blog-status", protect, adminProtect, updateBlogStatus);
adminRouter.get("/dashboard", protect, adminProtect, getDashboard);

export default adminRouter;