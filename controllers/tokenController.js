const mongoose = require('mongoose')

const Token = require('../models/token')

const addToken = async(refreshToken, username) => {
    if (!username.length) {
        return { status: false, message: "Username cannot be empty!" }
    }
    if (!refreshToken.length) {
        return { status: false, message: "Empty Token!" }
    }
    try {
        let user = await Token.findOne({ username })
        if (user) {
            await user.remove()
        }
        let token = new Token({ username, token: refreshToken })
        await token.save()
        return { status: true, message: "Token saved successfully!" }
    } catch (error) {
        return { status: false, message: "An Error occured : " + error.message }
    }
}


const logoutUser = async(username) => {
    if (!username.length) {
        return { status: false, message: "Invalid username!" }
    }
    try {
        let token = await Token.findOne({ username })
        if (!token) {
            return { status: false, message: "Username not found!" }
        } else {
            await token.remove()
            return { status: true, message: "Logout Successful!" }
        }
    } catch (error) {
        return { status: false, message: "An Error occured : " + error.message }
    }
}

const findToken = async(token, username) => {
    if (!username.length) {
        return { status: false, message: "Invalid username!" }
    }
    if (!token.length) {
        return { status: false, message: "Empty token!" }
    }
    try {
        let existingToken = await Token.findOne({ username, token })
        if (!existingToken) {
            return { status: false, message: "Invalid Refresh Token!" }
        } else {
            return { status: true, message: "Valid Refresh Token" }
        }
    } catch (error) {
        return { status: false, message: "An Error occured : " + error.message }
    }
}

const checkRefreshToken = async(username) => {
    if (!username.length) {
        return { status: false, message: "Invalid username!" }
    }
    try {
        let token = await Token.findOne({ username })
        if (!token) {
            return { status: false, message: "Username not found!" }
        } else {
            return { status: true, message: "Session is valid!" }
        }
    } catch (error) {
        return { status: false, message: "An Error occured : " + error.message }
    }
}

module.exports = {
    addToken,
    logoutUser,
    findToken,
    checkRefreshToken
}