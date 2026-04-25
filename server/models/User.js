const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    password: {
        type:String,
        require:true
    },
    permissions: {
        type:Array,
        default:[]
    }
}, {timestamps:true})

const User = mongoose.model('users', UserSchema)
module.exports = User