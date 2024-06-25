const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
]


const resetUsers = async () => {
  await User.deleteMany({})
  const passwordHash1 = await bcrypt.hash("samplepassword", 10)
  const passwordHash2 = await bcrypt.hash("fakepassword", 10)
  const user1 = new User({
    username: "sample",
    name: "Sample User",
    blogs: [],
    passwordHash: passwordHash1
  })
  const user2 = new User({
    username: "fake",
    name: "Fake User",
    passwordHash: passwordHash2,
    blogs: []
  })
  
  await user1.save()
  await user2.save()
}

const resetBlogs = async () => { 
  await Blog.deleteMany({})
  const user = await User.findOne({ username: 'sample' })
  
  const blogObjects = initialBlogs.map(blog => new Blog({...blog, user: user._id}))
  const promiseArray = blogObjects.map(async (blog) => {
    await blog.save()
    user.blogs = user.blogs.concat(blog._id)
  })
  await user.save()
  await Promise.all(promiseArray)
}

const generateUserToken = (user) => {
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  return token
}


const nonExistingId = async () => {
  const blog = new Blog({
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const blogsInDb = async () => { 
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())

}

const sampleBlog = {
  title: "This is a sample blog!",
  author: "Sample Author",
  url: "http://sample.com/",
  likes: 4
}


module.exports = { usersInDb, initialBlogs, blogsInDb, nonExistingId, resetUsers, resetBlogs, generateUserToken, sampleBlog}