const mongoose = require('mongoose')

const Posts = require('../models/posts')
const User = require('../models/user')

const getAllPosts = async(username) => {
    try {
        let user = await User.findOne({ username })
        if (!user) {
            return { status: false, message: 'User not found!' }
        } else {
            let posts = await Posts.find({ author: user._id })
            return { status: true, message: posts }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

const createPost = async(username, post) => {
    try {
        let user = await User.findOne({ username })
        if (!user) {
            return { status: false, message: 'User not found!' }
        } else {
            let newPost = new Posts({ post: post, author: user._id })
            let createdPost = await newPost.save()
            return { status: true, message: 'Successfully created new post!' }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

const deletePost = async(username, post_id) => {
    try {
        let user = await User.findOne({ username })
        if (!user) {
            return { status: false, message: 'User not found!' }
        } else {
            let post = await Posts.findOne({ _id: post_id })
            if (!post) {
                return { status: false, message: `Post doesn't exist!` }
            } else {
                if (post.author === user._id) {
                    await post.remove()
                    return { status: true, message: `Post deleted successfully!` }
                } else {
                    return { status: false, message: 'Only authors can delete posts!' }
                }
            }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

module.exports = {
    getAllPosts,
    createPost,
    deletePost
}