import express from 'express'
import { addBlog, addComment, deleteBlogById, generateContent, getAllBlogs, getBlogById, getBlogComments, getMyBlogs, updateBlog } from '../controllers/blogController.js';
import upload from '../middleware/multer.js';
import { protect } from '../middleware/authMiddleware.js';

const blogRouter = express.Router();

blogRouter.post("/add", protect, upload.single('image'), addBlog);
blogRouter.post("/update", protect, upload.single('image'), updateBlog);
blogRouter.get('/all', getAllBlogs);
blogRouter.get('/my-blogs', protect, getMyBlogs);
blogRouter.get('/:blogId', getBlogById);
blogRouter.post('/delete', protect, deleteBlogById);

blogRouter.post('/add-comment', protect, addComment);
blogRouter.post('/comments', getBlogComments);

blogRouter.post('/generate', protect, generateContent);
export default blogRouter;