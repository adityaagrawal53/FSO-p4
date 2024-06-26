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
