const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema({
    categoryid: {
        type: String,
        required: true,
    },
    categoryname: {
        type: String,
        required: true,
    },
    categorydescription: {
        type: String,
        required: true,
    },
    categoryoffer:{
        type:Number,
        required:true
    } 
})
const Category = mongoose.model('Category', categorySchema)
module.exports = Category
