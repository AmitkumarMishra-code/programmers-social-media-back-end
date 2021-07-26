const express = require('express')
const { getAllUsers } = require('../controllers/userController')
const router = express.Router()

router.get('/', async(req, res) => {
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

module.exports = router