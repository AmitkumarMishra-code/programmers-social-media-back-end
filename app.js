require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express()



app.use(morgan('dev'))
app.use(express.static('static'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(authChecker)

const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')

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
app.use('/post', authChecker, postRouter)

app.all(/.*/, (req, res) => {
    res.status(404).json({ message: 'Invalid endpoint. Please contact the admin.' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

function authChecker(req, res, next) {
    if (req.headers['authorization']) {
        let token = req.headers['authorization'].split(' ')[1]
        try {
            let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            req._username = decoded.username
            next()
        } catch (error) {
            res.status(401).json({ message: 'Token Expired!' })
        }
    } else {
        next()
    }
}