const  express = require('express');
const { 
  createBlog,
  getBlogById,
  getAllBlogs,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');

const router = express.Router();
// Create a new blog
router.post('/blogs', createBlog);

// Get all blogs
router.get('/blogs', getAllBlogs);

// Get blog by ID
router.get('/blogs/:id', getBlogById);

// Update a blog
router.put('/blogs/:id', updateBlog);

// Delete a blog
router.delete('/blogs/:id', deleteBlog);

module.exports = router;