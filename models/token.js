const mongoose = require('mongoose')

const TokenSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const TokenModel = mongoose.model('Token', TokenSchema)

module.exports = TokenModel