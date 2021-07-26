const mongoose = require('mongoose')

const Posts = require('../models/posts')
const User = require('../models/user')

const getAllPosts = async(username) => {
    try {
        let user = await User.findOne({ username })
        if (!user) {
            return { status: false, message: 'User not found!' }
        } else {
            let posts = await Posts.find({ author: user._id }).populate('author', 'username')
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
            createdPost._doc.author = { username }
            return { status: true, message: createdPost }
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

const getFollowedUserPosts = async(username) => {
    try {
        let currentUser = await User.findOne({ username })
        if (!currentUser) {
            return { status: false, message: 'User not found!' }
        } else {

            let following = currentUser.following.map(user => user._id)
            let posts = await Posts.find({ author: { "$in": following } }, { post: 1, author: 1, createdAt: 1, likes: 1 }).populate('author', 'username')
            posts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
            let postsToSend = []
            if (posts.length > 20) {
                postsToSend = posts.slice(0, 20)
            } else {
                postsToSend = [...posts]
            }
            let likesMap = postsToSend.map(post => post.likes.includes(currentUser._id) ? true : false)
            return { status: true, message: { posts: postsToSend, likesMap: likesMap } }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

const likePost = async(username, postId) => {
    try {
        let currentUser = await User.findOne({ username })
        if (!currentUser) {
            return { status: false, message: 'User not found!' }
        } else {
            let post = await Posts.findOne({ _id: postId })
            console.log(post)
            if (!post) {
                return { status: false, message: `Post doesn't exist!` }
            } else {
                post.likes.push(currentUser._id)
                await post.save()
                return { status: true, message: 'Successfully liked the post!' }
            }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

const unlikePost = async(username, postId) => {
    try {
        let currentUser = await User.findOne({ username })
        if (!currentUser) {
            return { status: false, message: 'User not found!' }
        } else {
            let post = await Posts.findOne({ _id: postId })
            if (!post) {
                return { status: false, message: `Post doesn't exist!` }
            } else {
                post.likes.pull(currentUser._id)
                await post.save()
                return { status: true, message: 'Successfully unliked the post!' }
            }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

module.exports = {
    getAllPosts,
    createPost,
    deletePost,
    getFollowedUserPosts,
    likePost,
    unlikePost
}