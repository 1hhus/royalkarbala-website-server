const mongoose = require('mongoose')
const Schema = mongoose.Schema 
const CategorySchema = new Schema({
    names: {
        type:Array
    },
    isHidden: {
        type:Boolean,
        default:false
    },
    order:{
        type:Number
    }

}, {timestamps:true, _id:true})

const Category = mongoose.model("categories", CategorySchema)

module.exports = Category