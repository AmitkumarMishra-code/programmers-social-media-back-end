const express = require('express')
const { likePost } = require('../controllers/postContoller')
const router = express.Router()

router.post('/:id', async(req, res) => {
    let response = await likePost(req._username, req.params.id)
    if (response.status) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(400).json({ message: response.message })
    }
})

module.exports = router