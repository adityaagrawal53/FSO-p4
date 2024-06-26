const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()

const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username:1 , name:1})
  response.json(blogs)
})

blogsRouter.put('/:id', async (request, response) => { 
  const user = request.user
  if (!user) { return response.status(401).json({ error: 'token invalid' })}

  const body = request.body
  const blog = { 
    author: body.author,
    url : body.url,
    likes : body.likes,
    title: body.title,
    user
  }
  const blogToUpdate = await Blog.findById(request.params.id)
  if (blogToUpdate.user.toString() !== request.user.id) { return response.status(401).json({ error: 'unauthorized' }) }
  if (!blogToUpdate) { return response.status(404).end() }
  
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new : true})

  response.json(updatedBlog)
})

blogsRouter.post('/', async (request, response) => {
  const user = request.user
  const blog = new Blog({
    ...request.body,
    user: user
  })

  if (!blog.likes) {blog.likes = 0}
  if (!blog.title || !blog.url) { return response.status(400).end()  }
  if ( !user ) { 
    return response.status(401).json({ error: 'token missing or invalid' }) }

  
  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()
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
  if (!request.user) { return response.status(401).json({ error: 'token invalid' })}
  const blog = await Blog.findById(request.params.id)
  
  if (!blog) { return response.status(404).end() }
  if (blog.user.toString() !== request.user.id) { return response.status(401).json({ error: 'unauthorized' }) }
  
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})



module.exports = blogsRouter
