const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  if (!blog.likes) {blog.likes = 0}
  if (!blog.title || !blog.url) { return response.status(400).end()  }
  
  const result = await blog.save()
  response.status(201).json(result)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => { 
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => { 
  const body = request.body
  const blog = { 
    author: body.author,
    url : body.url,
    likes : body.likes,
    title: body.title,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new : true})
  response.json(updatedBlog)

})

module.exports = blogsRouter
