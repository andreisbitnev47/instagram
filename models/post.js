const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    description: { type: String },
    imageUrl: { type: String }
});

module.exports = mongoose.model('Post', PostSchema);