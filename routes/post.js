const express = require('express')
const { getAllPosts, createPost, deletePost } = require('../controllers/postContoller')
const router = express.Router()

router.get('/', async(req, res) => {
    let response = await getAllPosts(req._username)
    if (response.status) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(400).json({ message: response.message })
    }
})

router.post('/', async(req, res) => {
    let { post } = req.body
    if (!post || !post.length) {
        res.status(401).json({ message: 'Missing parameters!' })
    } else {
        let response = await createPost(req._username, post)
        if (response.status) {
            res.status(200).json({ message: response.message })
        } else {
            res.status(400).json({ message: response.message })
        }
    }
})

router.delete('/:id', async(req, res) => {
    let response = await deletePost(req._username, req.params.id)
    if (response.status) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(400).json({ message: response.message })
    }
})

module.exports = router;