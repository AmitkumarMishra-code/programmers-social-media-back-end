const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt')



const createNewUser = async(username, email, password, photoURL) => {
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
        const user = new User({ username, email, password: hashedPassword, photoURL })
        let newUser = await user.save()
        return { status: true, message: `New user created with email id : ${email}` }
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
            let result = bcrypt.compare(password, user.password)
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


module.exports = {
    createNewUser,
    loginUser
}