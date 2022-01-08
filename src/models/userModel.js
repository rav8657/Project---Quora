const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
  
    phone: {
        type: String,
        trim: true,
        unique: true
    },

    password: { type: String, required: true },

    creditScore :{type:Number, default:500},

    createdAt:{type: Date,default: Date.now},

    updatedAt:{type:Date, default:Date.now}

 
});

module.exports = mongoose.model('User_Project6', userSchema)