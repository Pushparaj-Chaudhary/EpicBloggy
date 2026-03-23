import fs from "fs";
import { format } from "path";
import Blog from "../models/Blog.js";
import imagekit from "../config/imageKit.js";
import Comment from "../models/Comment.js";
import main from "../config/Gemini.js";
import cache from "../utils/cache.js";
import sanitizeHtml from "sanitize-html";
import mongoose from "mongoose";
export const addBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = JSON.parse(
      req.body.blog,
    );
    const imageFile = req.file;

    if (!title || !description || !category || !imageFile) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const authorId = req.user._id;

    const fileBuffer = fs.readFileSync(imageFile.path);

    // upload image to imagekit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    // optimizationn through imagekit url transformation
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" }, // auto compression
        { format: "webp" }, // convert to modern format
        { width: "1280" }, // width resizing
      ],
    });

    const image = optimizedImageUrl;

    // Sanitize Rich Text Content
    const sanitizedDescription = sanitizeHtml(description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span']),
      allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['style', 'class'] }
    });

    const status = (req.user.role === 'admin' && isPublished) ? 'approved' : 'pending';

    await Blog.create({
      title,
      subTitle,
      description: sanitizedDescription,
      category,
      image,
      imageFileId: response.fileId,
      author: authorId,
      status,
    });

    // Clear cache whenever a new blog is submitted
    cache.flushAll();

    res.json({ success: true, message: status === 'approved' ? "Blog published successfully" : "Blog submitted for approval" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const category = req.query.category || 'All';

    // Construct a unique cache key for this result
    const cacheKey = `blogs_${page}_${limit}_${category}`;

    // Check if the exact request exists in cache
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    const query = { status: 'approved' };
    if (category !== 'All') {
      query.category = category;
    }

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const responseData = { success: true, blogs, totalPages, currentPage: page };

    // Set data in cache
    cache.set(cacheKey, responseData);

    res.json(responseData);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.json({ success: false, message: "Invalid blog ID" });
    }

    const blog = await Blog.findById(blogId)
      .populate({ path: 'author', select: 'name', options: { strictPopulate: false } })
      .lean();
    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, blog });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;

    // Find blog to get imageFileId
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }

    if (blog.imageFileId) {
      try {
        await imagekit.deleteFile(blog.imageFileId);
      } catch (ikError) {
        console.error("Failed to delete ImageKit file:", ikError);
      }
    }

    await Blog.findByIdAndDelete(id);

    // Delete all comments associated with the blog
    await Comment.deleteMany({ blog: id });
    cache.flushAll();
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { blog, content } = req.body;
    await Comment.create({ blog, user: req.user._id, content, status: 'pending' });
    res.json({ success: true, message: "Comment added for review" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.json({ success: false, message: "Invalid blog ID" });
    }

    const comments = await Comment.find({
      blog: blogId,
      status: 'approved',
    }).populate({ path: 'user', select: 'name', options: { strictPopulate: false } })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, comments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    const blogPrompt = `
You are a professional blog writer.

Write a high-quality, engaging blog post based on the following title:

"${prompt}"

Guidelines:
- Write in a natural, human-like tone (not robotic)
- Make it engaging from the first line (strong hook)
- Use clear headings (H1, H2, H3 where needed)
- Structure the blog logically (introduction, main content, insights, conclusion)
- Add examples or relatable situations if possible
- Keep paragraphs short and readable
- Use bullet points where appropriate
- Maintain a slightly motivational and insightful tone
- Avoid repeating generic definitions
- Make it feel like a real published blog

Length:
- Medium (not too short, not too long)

Important:
- Do NOT strictly follow a fixed template
- Adapt structure based on the topic
- Make it feel unique and professional
`;
    const content = await main(blogPrompt);

    res.json({ success: true, content });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id, title, subTitle, description, category, isPublished } = JSON.parse(
      req.body.blog,
    );
    const imageFile = req.file;

    if (!id) {
        return res.json({ success: false, message: "Blog ID is required" });
    }

    const blogToUpdate = await Blog.findById(id);
    if (!blogToUpdate) {
        return res.json({ success: false, message: "Blog not found" });
    }

    let image = blogToUpdate.image;
    let imageFileId = blogToUpdate.imageFileId;

    if (imageFile) {
      const fileBuffer = fs.readFileSync(imageFile.path);

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: imageFile.originalname,
        folder: "/blogs",
      });

      const optimizedImageUrl = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });

      image = optimizedImageUrl;
      imageFileId = response.fileId;
    }

    const sanitizedDescription = sanitizeHtml(description || blogToUpdate.description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span']),
      allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['style', 'class'] }
    });

    const status = (req.user.role === 'admin' && isPublished) ? 'approved' : 'pending';

    blogToUpdate.title = title || blogToUpdate.title;
    blogToUpdate.subTitle = subTitle || blogToUpdate.subTitle;
    blogToUpdate.description = sanitizedDescription;
    blogToUpdate.category = category || blogToUpdate.category;
    blogToUpdate.image = image;
    blogToUpdate.imageFileId = imageFileId;
    blogToUpdate.status = status;

    await blogToUpdate.save();

    cache.flushAll();

    res.json({ success: true, message: "Blog updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
