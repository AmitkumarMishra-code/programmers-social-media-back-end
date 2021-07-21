const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    photoURL: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    following: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    }],
    followers: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel