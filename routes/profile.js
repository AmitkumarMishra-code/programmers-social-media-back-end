const express = require('express')
const { getCurrentProfile, getUserProfile } = require('../controllers/userController')
const router = express.Router()

router.get('/', async(req, res) => {
    let response = await getCurrentProfile(req._username)
    if (response.status) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(400).json({ message: response.message })
    }
})

router.get('/:id', async(req, res) => {
    console.log(req._username, req.params.id)
    let response = await getUserProfile(req._username, req.params.id)
    if (response.status) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(400).json({ message: response.message })
    }
})

module.exports = router