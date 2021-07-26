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
const followRouter = require('./routes/follow')
const unfollowRouter = require('./routes/unfollow')
const usersToFollowRouter = require('./routes/users')
const feedRouter = require('./routes/feed')
const profileRouter = require('./routes/profile')
const likeRouter = require('./routes/like')
const unlikeRouter = require('./routes/unlike')
const { logoutUser, checkRefreshToken } = require('./controllers/tokenController')

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
app.use('/post', postRouter)
app.use('/follow', followRouter)
app.use('/unfollow', unfollowRouter)
app.use('/users', usersToFollowRouter)
app.use('/feed', feedRouter)
app.use('/profile', profileRouter)
app.use('/like', likeRouter)
app.use('/unlike', unlikeRouter)

app.get('/logout', async(req, res) => {
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


app.all(/.*/, (req, res) => {
    res.status(404).json({ message: 'Invalid endpoint. Please contact the admin.' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

async function authChecker(req, res, next) {
    console.log('authchecker called')
    if (req.headers['authorization']) {
        let token = req.headers['authorization'].split(' ')[1]
        try {

            let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            req._username = decoded.username
            let response = await checkRefreshToken(decoded.username)
            if (response.status) {
                next()
            } else {
                res.status(401).json({ message: 'Session Expired! Login again!' })
            }
        } catch (error) {
            console.log('Expired!')
            res.status(403).json({ message: 'Token Expired!' })
        }
    }
}