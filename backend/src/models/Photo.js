const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        maxlength: 2200 // Instagram benzeri uzunluk
    },
    averageRating: {
        type: Number,
        default: 0
    },
    ratings: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            score: {
                type: Number,
                min: 1,
                max: 5
            }
        }
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            text: {
                type: String,
                required: true,
                maxlength: 500
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    isApproved: { // Admin onayı için
        type: Boolean,
        default: false
    },
    rejectedReason: String, // Reddedilme sebebi
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Photo', photoSchema);
