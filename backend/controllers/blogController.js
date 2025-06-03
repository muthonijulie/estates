const Blog = require('../models/Blog');

const createBlog = async (req, res) => {
    try {
        const newBlog = new Blog(req.body);
        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(400).json({ error: "Bad request" });
    }
}

const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).json({ error: "Bad request" });
    }
}

const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    createBlog,
    getBlogById,
    getAllBlogs,
    updateBlog,
    deleteBlog
}