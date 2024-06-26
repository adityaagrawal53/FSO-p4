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
describe('GET /api/users tests', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  test('correct amount of users is returned', async () => {
    const response = await api.get('/api/users')
    assert.strictEqual(response.body.length, 2)
  })
})

describe('POST /api/users tests', () => {
  test('a valid user can be added using the post method', async () => {
    const initialUsers = await api.get('/api/users')

    await api
      .post('/api/users')
      .send(helper.sampleUser)
      .expect(201)

    const response = await api.get('/api/users')
    assert(response.body.length === initialUsers.body.length + 1)
  })
  test('adding user without a field gives status code 400', async () => {
    const initialUsers = await api.get('/api/users')

    await api
      .post('/api/users')
      .send({ ...helper.sampleUser, password: null })
      .expect(400)

    const response = await api.get('/api/users')
    assert(response.body.length === initialUsers.body.length)
  })
})

describe('POST /api/login tests', () => {
  test('login with valid credentials returns a token', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: "sample", password: "samplepassword" })
      .expect(200)
    assert(response.body.token !== undefined)
  })
  test('login with invalid credentials returns status code 401', async () => {
    await api
      .post('/api/login')
      .send({ username: "sample", password: 'sdfadfsfsdf' })
      .expect(401)
  })
})

after(async () => {
  await mongoose.connection.close()
})