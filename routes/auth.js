const express = require('express')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'static/uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const multipart = multer({ storage: storage })

const { addToken, logoutUser, findToken } = require('../controllers/tokenController')
const { createNewUser, loginUser } = require('../controllers/userController')

const router = express.Router()

// router.get('/', (req, res) => {
//     res.status(200).send({ message: 'Connected to auth' })
// })

router.post('/signup', multipart.single('profilePic'), async(req, res) => {

    req.body.photoURL = req.file ? req.file.path : null

    if (!req.body.username || !req.body.email || !req.body.password) {
        res.status(401).json({ message: "Missing parameters!" })
    } else {
        let request = await createNewUser(req.body.username, req.body.email, req.body.password, req.body.photoURL, req.body.name)
        if (request.status) {
            res.status(200).json({ message: request.message })
        } else {
            res.status(400).json({ message: request.message })
        }
    }
})

router.post('/login', async(req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        res.status(401).json({ message: "Missing parameters!" })
    } else {
        let request = await loginUser(username, password)
        if (!request.status) {
            res.status(400).json({ message: request.message })
        } else {
            let payload = {
                username
            }
            let token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME })
            let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME })
            let saveTokenRequest = await addToken(refreshToken, username)
            if (saveTokenRequest.status) {
                res.status(200).json({ access_Token: token, refresh_Token: refreshToken })
            } else {
                res.status(401).json({ message: saveTokenRequest.message })
            }
        }
    }
})

router.get('/logout', async(req, res) => {
    let token = req.headers['authorization'].split(' ')[1]
    try {
        let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        let request = await logoutUser(decoded.username)
        if (request) {
            res.status(200).json({ message: request.message })
        } else {
            res.status(400).json({ message: request.message })
        }
    } catch (error) {
        res.status(400).json({ message: "An Error occured : " + error.message })
    }
})

router.post('/token', async(req, res) => {
    const { token } = req.body
    if (!token) {
        res.status(401).json({ message: 'Invalid or missing token!' })
    } else {
        try {
            let decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
            let validToken = await findToken(token, decoded.username)
            if (!validToken.status) {
                res.status(401).json(validToken.message)
            } else {
                let payload = {
                    username: decoded.username
                }
                let newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME })
                res.status(200).json({ 'access_token': newAccessToken })
            }
        } catch (error) {
            res.status(401).json({ message: error.message })
        }
    }
})

module.exports = router