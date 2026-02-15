const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        default: null
    },
    groupAvatar: {
        type: String,
        default: null
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
conversationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
