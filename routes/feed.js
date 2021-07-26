const express = require('express')
const { getFollowedUserPosts } = require('../controllers/postContoller')
const router = express.Router()

router.get('/', async(req, res) => {
    let response = await getFollowedUserPosts(req._username)
    if (response.status) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(400).json({ message: response.message })
    }
})

module.exports = router