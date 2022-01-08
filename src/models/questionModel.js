const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({

    description: {
        type: String,
        required: true,
        unique: true
    },

    tag: {
        type: [String],
        trim: true,
    },

      askedBy: {
        type:mongoose.Types.ObjectId,
        ref: 'User_Project6'
    },

    deletedAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },

    createdAt:{type: Date,default: Date.now},

    updatedAt:{type:Date, default:Date.now}

});

module.exports = mongoose.model('Question_Project6', questionSchema)