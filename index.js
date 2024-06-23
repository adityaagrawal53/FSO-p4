const express = require('express')
const app = express()

require('dotenv').config()
app.use(express.static('dist'))

const Person = require('./models/person')
var morgan = require('morgan')
morgan.token('data', (req) => JSON.stringify(req.body))
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))


app.get('/api/persons', (_request, response, next) => {
  Person.find({}).then(person => {
    response.json(person)
  })
    .catch(error => { next(error) })
})

app.get('/info', (_request, response, next) => {
  Person.countDocuments({}).then(count => {
    response.send(
      `<p>Phonebook has info for ${count} persons<br/>${new Date()}</p>`
    )
  }).catch(error => { next(error) })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => { next(error) })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const postMorgan = morgan(':method :url :status :res[content-length] - :response-time ms :data')

app.post('/api/persons', postMorgan, (request, response, next) => {
  const body = request.body

  if (!(body.name && body.number)) {
    response.status(400)
    return response.json({
      error: 'name or number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(
    request.params.id, person, { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, _request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
