const mongoose = require('mongoose')

const PostsSchema = new mongoose.Schema({
    post: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

const PostsModel = mongoose.model('Posts', PostsSchema)

module.exports = PostsModel