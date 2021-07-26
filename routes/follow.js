const express = require('express')
const { followUser } = require('../controllers/userController')
const router = express.Router()

router.post('/:id', async(req, res) => {
    let userId = req.params.id
    let response = await followUser(req._username, userId)
    if (response.status) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(400).json({ message: response.message })
    }
})

module.exports = router