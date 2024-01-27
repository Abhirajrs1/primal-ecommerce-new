const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    productid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: [{
        type: String,
        required: true
    }],
    categoryname: {
        type: String,
        required: true
    },
    unlist: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        required:true   
    }
})

const productCollection = new mongoose.model("product", productSchema);


module.exports = productCollection;