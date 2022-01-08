const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({

    answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User_Project6',
        required: true
    },

    text: {
        type: String,
        required: true,
        trim: true
    },

    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question_Project6',
        required: true
    },
    deletedAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },


}, { timestamps: true })

module.exports = mongoose.model('Answer_Project6', answerSchema)
