const mongoose = require('mongoose')
const Schema = mongoose.Schema

const dishSchema = new Schema({
    names:{
        type:Array,
        require:true,
    },
    description: {
        type:Array,
        require:true,
    },
    price: {
        type:Number,
        require:true,
        min:0
    },
    image: {
        type:String,
        require:true,
    },
    category: {
        type:mongoose.Schema.ObjectId,
        require:true,
    },
    isHidden: {
        type:Boolean,
        default:false,
    },
    order: {
        type:Number
    }
})

const Dish = mongoose.model("dishes", dishSchema)
module.exports = Dish