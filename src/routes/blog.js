const { Router } = require('express');
const router = Router();
const auth = require('../middleware/auth');

const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog, subirImagen,deleted } = require('../controllers/blog.controllers');
const { route } = require('./administrador');



router.route('/')
    .get(getBlogs)//Get de all blog dates
    .post(auth,subirImagen, createBlog);//Add a new blog


router.route('/:id')
    .put(auth,subirImagen, updateBlog)//Update a blog
    .delete(auth,deleteBlog);//Delete a blog

router.route('/:url').get(getBlog);//Get one blog dates



module.exports = router;