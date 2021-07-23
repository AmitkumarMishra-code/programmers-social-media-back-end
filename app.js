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


const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')
const { followUser, unfollowUser, getAllUsers } = require('./controllers/userController')
const { logoutUser } = require('./controllers/tokenController')

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
app.use(authChecker)
app.use('/post', authChecker, postRouter)

app.post('/follow/:id', authChecker, async(req, res) => {
    let userId = req.params.id
    let response = await followUser(req._username, userId)
    if (response.status) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(400).json({ message: response.message })
    }
})

app.post('/unfollow/:id', authChecker, async(req, res) => {
    let userId = req.params.id
    let response = await unfollowUser(req._username, userId)
    if (response.status) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(400).json({ message: response.message })
    }
})

app.get('/logout', authChecker, async(req, res) => {
    try {
        let request = await logoutUser(req._username)
        if (request) {
            res.status(200).json({ message: request.message })
        } else {
            res.status(400).json({ message: request.message })
        }
    } catch (error) {
        res.status(400).json({ message: "An Error occured : " + error.message })
    }
})

app.get('/users', authChecker, async(req, res) => {
    try {
        let request = await getAllUsers(req._username)
        if (request) {
            res.status(200).json({ message: request.message })
        } else {
            res.status(400).json({ message: request.message })
        }
    } catch (error) {
        res.status(400).json({ message: "An Error occured : " + error.message })
    }
})

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
            console.log('Expired!')
            res.status(403).json({ message: 'Token Expired!' })
        }
    }
}