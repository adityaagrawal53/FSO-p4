const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((i, blog) => i + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) { return null }
  return blogs.reduce((i, blog) => blog.likes > i.likes ? blog : i, blogs[0])
}

const _ = require('lodash');

const mostBlogs = (blogs_) => {
  if (blogs_.length === 0) { return null }
  const [author, blogs]  = _.maxBy(_.entries(_.countBy(blogs_, 'author')), (entry) => entry[1])
  return {author, blogs}
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) { return null }

  const grouped = _.groupBy(blogs, 'author')
  const mapped = _.map(grouped, (blogs_, author) => {
    return ({ 
      author, 
      likes: _.sumBy(blogs_, 'likes') 
    })
  })
  
  return _.maxBy(mapped, 'likes')
}


module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}