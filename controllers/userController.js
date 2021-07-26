const mongoose = require('mongoose')
const User = require('../models/user')
const Posts = require('../models/posts')
const bcrypt = require('bcrypt')



const createNewUser = async(username, email, password, photoURL, name) => {
    console.log(photoURL)
    if (!username.length) {
        return { status: false, message: 'Username cannot be empty' }
    }
    if (!email.length) {
        return { status: false, message: 'Email cannot be empty' }
    }
    if (!password.length) {
        return { status: false, message: 'Password cannot be empty' }
    }
    if (!(/.*@.*\..*/.test(email))) {
        return { status: false, message: 'Invalid Email' }
    }
    if (!photoURL || !photoURL.length) {
        photoURL = '/images/default.png'
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    try {
        let existingUser = await User.findOne({ username })
        if (existingUser) {
            return { status: false, message: "Username already exists!" }
        } else {
            let existingEmail = await User.findOne({ email })
            if (existingEmail) {
                return { status: false, message: "Email is already registered with another account!" }
            } else {
                const user = new User({ username, email, password: hashedPassword, photoURL, name })
                let newUser = await user.save()
                return { status: true, message: `New user created with email id : ${email}` }
            }
        }
    } catch (error) {
        return { status: false, message: "An Error occured : " + error.message }
    }
}

const loginUser = async(username, password) => {
    if (!username.length) {
        return { status: false, message: "Username cannot be empty!" }
    }
    if (!password.length) {
        return { status: false, message: "Password cannot be empty!" }
    }
    try {
        let user = await User.findOne({ username })
        if (!user) {
            return { status: false, message: "Username not found!" }
        } else {
            let result = await bcrypt.compare(password, user.password)
            if (!result) {
                return { status: false, message: "Invalid password!" }
            } else {
                return { status: true, message: "Login Successful!" }
            }
        }
    } catch (error) {
        return { status: false, message: "An Error occured : " + error.message }
    }
}

const followUser = async(currentUser, userToFollow) => {
    try {
        let validUser = await User.findOne({ username: userToFollow })
        if (!validUser) {
            return { status: false, message: `This user doesn't exist! Try again!!` }
        } else {
            let user = await User.findOne({ username: currentUser })
            validUser.followers.push(user._id)
            await validUser.save()
            user.following.push(validUser._id)
            await user.save()
            return { status: true, message: 'Successfully followed ' + userToFollow }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

const unfollowUser = async(currentUser, userToFollow) => {
    try {
        let validUser = await User.findOne({ username: userToFollow })
        if (!validUser) {
            return { status: false, message: `This user doesn't exist! Try again!!` }
        } else {
            let user = await User.findOne({ username: currentUser })
            validUser.followers.pull(user._id)
            await validUser.save()
            user.following.pull(validUser._id)
            await user.save()
            return { status: true, message: 'Successfully unfollowed ' + userToFollow }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

const getAllUsers = async(username) => {
    try {
        let currentUser = await User.findOne({ username }).populate('following', 'username')
        if (!currentUser) {
            return { status: false, message: `Invalid User! Try again!!` }
        } else {
            let usersToFollow = await User.find({}, { password: 0, name: 0, createdAt: 0, updatedAt: 0 })
            let alreadyFollowedUser = currentUser.following
            let filteredUsersToFollow = usersToFollow.filter(user => user.username !== currentUser.username).filter(user => alreadyFollowedUser.every(followed => followed.username !== user.username))
            return { status: true, message: filteredUsersToFollow }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

const getCurrentProfile = async(currentUser) => {
    try {
        let userDetails = await User.findOne({ username: currentUser }, { following: 1, followers: 1, photoURL: 1, name: 1 })
        let posts = await Posts.find({ author: userDetails._id }, { post: 1, author: 1, createdAt: 1, likes: 1 }).populate('author', 'username')
        posts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        let postsToSend = []
        if (posts.length > 10) {
            postsToSend = posts.slice(0, 10)
        } else {
            postsToSend = [...posts]
        }
        let likesMap = postsToSend.map(post => post.likes.includes(userDetails._id) ? true : false)
        let userObject = {
            username: currentUser,
            following: userDetails.following.length,
            followers: userDetails.followers.length,
            photoURL: userDetails.photoURL,
            name: userDetails.name,
            posts: postsToSend,
            likesMap: likesMap,
            self: true,
            currentlyFollowing: false
        }
        return { status: true, message: userObject }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

const getUserProfile = async(currentUser, profileToGet) => {
    try {
        let currentUserDetails = await User.findOne({ username: currentUser })
        let userDetails = await User.findOne({ username: profileToGet }, { following: 1, followers: 1, photoURL: 1, name: 1 }).populate('followers', 'username')
        let posts = await Posts.find({ author: userDetails._id }, { post: 1, author: 1, createdAt: 1, likes: 1 }).populate('author', 'username')
        posts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        let postsToSend = []
        if (posts.length > 10) {
            postsToSend = posts.slice(0, 10)
        } else {
            postsToSend = [...posts]
        }
        let likesMap = postsToSend.map(post => post.likes.includes(currentUserDetails._id) ? true : false)
        let currentlyFollowing = false

        for (let users of userDetails.followers) {
            if (users.username === currentUser) {
                currentlyFollowing = true
            }
        }
        let userObject = {
            username: profileToGet,
            following: userDetails.following.length,
            followers: userDetails.followers.length,
            photoURL: userDetails.photoURL,
            name: userDetails.name,
            posts: postsToSend,
            likesMap: likesMap,
            self: false,
            currentlyFollowing: currentlyFollowing
        }
        return { status: true, message: userObject }
    } catch (error) {
        console.log(error.message)
        return { status: false, message: error.message }
    }
}


module.exports = {
    createNewUser,
    loginUser,
    followUser,
    unfollowUser,
    getAllUsers,
    getCurrentProfile,
    getUserProfile
}