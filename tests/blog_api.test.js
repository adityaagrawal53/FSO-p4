const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./helper')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const logger = require('../utils/logger')

const api = supertest(app)

beforeEach(async () => {
  await helper.resetUsers()
  await helper.resetBlogs()
})



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
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })
  
  test('id property of the blog posts is defined', async () => {
    const response = await api.get('/api/blogs')
    assert(response.body[0].id !== undefined)
  })
})

describe('POST /api/json tests', () => {
  test('a valid blog can be added using the post method and a user auth token', async () => {
    const initialBlogs = await api.get('/api/blogs')

    const user = await User.findOne({}) 
    const token = helper.generateUserToken(user)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(helper.sampleBlog)

    const response = await api.get('/api/blogs')
    assert(response.body.length === initialBlogs.body.length + 1)
  })
  
  test('if likes property is missing from added blog, its value defaults to 0 and is added', async () => {
    const user = await User.findOne({}) 
    const token = helper.generateUserToken(user)

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({...helper.sampleBlog, likes: null})
    
    assert(response.body.likes === 0)
  })
  
  test('if title property is missing from added blog, backend replies with status code 400', async () => {
    const initialBlogs = await api.get('/api/blogs')

    const user = await User.findOne({}) 
    const token = helper.generateUserToken(user)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({...helper.sampleBlog, title: null})
      .expect(400)
  
      const response = await api.get('/api/notes')
    assert.strictEqual(response.body.length, initialBlogs.length)
  })
  
  test('quirky if url property is missing from added blog, backend replies with status code 400', async () => {
    const initialBlogs = await api.get('/api/blogs')

    const user = await User.findOne({}) 
    const token = helper.generateUserToken(user)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({...helper.sampleBlog, url: null})
      .expect(400)
  
      const response = await api.get('/api/notes')
    assert.strictEqual(response.body.length, initialBlogs.length)
  })
})

describe('DELETE /api/json/:id tests', () => {

  test('a blog can be deleted from the backend', async () => { 
    const initialBlogs = await api.get('/api/blogs')
    const blogToDelete = initialBlogs.body[0]

    const user = await User.findOne({username: "sample"}) 
    const token = helper.generateUserToken(user)

    await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${token}`).expect(204)
    const laterBlogs = await api.get('/api/blogs')
    
    await api.get(`/api/blogs/${blogToDelete.id}`).expect(404)
    assert.strictEqual(laterBlogs.body.length, initialBlogs.body.length - 1)
  }) 
})

describe("PUT /api/blogs/:id", () => { 
  test('a blog can be updated', async () => { 
    const initialBlogs = await api.get('/api/blogs')
    const blogToUpdate = initialBlogs.body[0]

    const user = await User.findOne({username: "sample"}) 
    const token = helper.generateUserToken(user)

    const updatedBlog = {
      title: `${blogToUpdate.title} (updated)`,
      author: `${blogToUpdate.author} (updated)`,
      url: `${blogToUpdate.url}.updated.com`,
      likes: 15
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog).set('Authorization', `Bearer ${token}`)
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