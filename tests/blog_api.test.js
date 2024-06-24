const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

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


// DO NOT RUN ALL TESTS AT ONCE. SOME MIGHT FAIL DUE TO ASYNCRONOUS FUNCTIONALITY.
// RUN EACH DESCRIBE BLOCK INDIVIDUALLY BY DOING 
// $ npm test -- --test-name-pattern="describe block name here" 

describe('GET /api/json tests', () => { 
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('correct amount of blogs is returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
  })
  
  test('id property of the blog posts is defined', async () => {
    const response = await api.get('/api/blogs')
    assert(response.body[0].id !== undefined)
  })
})

describe('POST /api/json tests', () => {
  test('a valid blog can be added using the post method', async () => {
    const initialBlogs = await api.get('/api/blogs')
  
    const newBlog = {
      title: "This is a valid blog!",
      author: "Jane Doe",
      url: "http://trial.com/",
      likes: 4
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
  
    const response = await api.get('/api/blogs')
    assert(response.body.length === initialBlogs.body.length + 1)
  })
  
  test('if likes property is missing from added blog, its value defaults to 0 and is added', async () => {
    const initialBlogs = await api.get('/api/blogs')
  
    const newBlog = {
      title: "This does not have a likes property!",
      author: "Jane Doe",
      url: "http://no_likes.com/"
    }
  
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
  
    assert(response.body.likes === 0)
  })
  
  test('if title property is missing from added blog, backend replies with status code 400', async () => {
    const initialBlogs = await api.get('/api/blogs')
    const newBlog = {
      author: "Jane Doe",
      url: "http://no_title.com/"
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const response = await api.get('/api/notes')
  
    assert.strictEqual(response.body.length, initialBlogs.length)
  })
  
  test('if url property is missing from added blog, backend replies with status code 400', async () => {
    const initialBlogs = await api.get('/api/blogs')
    const newBlog = {
      author: "Jane Doe",
      title: "There is no URL!"
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const response = await api.get('/api/notes')
  
    assert.strictEqual(response.body.length, initialBlogs.length)
  })
})

describe('DELETE /api/json/:id tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
  
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('a blog can be deleted from the backend', async () => { 
    const initialBlogs = await api.get('/api/blogs')
    const blogToDelete = initialBlogs.body[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)
    const laterBlogs = await api.get('/api/blogs')
    
    await api.get(`/api/blogs/${blogToDelete.id}`).expect(404)
    assert.strictEqual(laterBlogs.body.length, initialBlogs.body.length - 1)
  }) 
})

describe("PUT /api/blogs/:id", () => { 
  test('a blog can be updated', async () => { 
    const initialBlogs = await api.get('/api/blogs')
    const blogToUpdate = initialBlogs.body[0]

    const updatedBlog = {
      title: `${blogToUpdate.title} (updated)`,
      author: `${blogToUpdate.author} (updated)`,
      url: `${blogToUpdate.url}.updated.com`,
      likes: 15
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const response = await api.get(`/api/blogs/${blogToUpdate.id}`)
    const recievedBlog = response.body

    assert.strictEqual(recievedBlog.title, updatedBlog.title)
    assert.strictEqual(recievedBlog.author, updatedBlog.author)
    assert.strictEqual(recievedBlog.url, updatedBlog.url)
    assert.strictEqual(recievedBlog.likes, updatedBlog.likes)
  })
})


after(async () => {
  await mongoose.connection.close()
})