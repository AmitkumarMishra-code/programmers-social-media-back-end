require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')

const app = express()

const authRouter = require('./routes/auth')

app.use(morgan('dev'))
app.use(express.static('static'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

app.get('/', (req, res) => {
    res.status(200).send({ message: 'Connected to server!' })
})

app.use('/auth', authRouter)

app.all(/.*/, (req, res) => {
    res.status(404).json({ response: 'Invalid endpoint. Please contact the admin.' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})