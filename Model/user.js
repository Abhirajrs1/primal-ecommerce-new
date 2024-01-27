const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    useremail: {
        type: String,
        required: true

    },
    userpassword: {
        type: String,
        required: true
    },
    usercontact: {
        type: Number,
        required: true
    },
    useraddress: [{
        id : {
            type : String,
            required : true
        },
        name: {
            type: String,
        },
        area: {
            type: String,
        },
        housenumber: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        pincode: {
            type: Number,
        },
    }],
    block: {
        type: Boolean,
        default: true
    },
    cart: [{
        productid: {
            type: String,
        },
        productname: {
            type: String,
        },
        productquantity: {
            type: Number,
            default: 1
        },
        productprice: {
            type: Number,
        },
        productcategory:{
            type:String
        },
        productimage: {
            type: [String],
        },
    }],
    wishlist: [{
        productid: {
            type: String,
        },
        productname: {
            type: String,
        },
        productquantity: {
            type: Number,
            default: 1
        },
        productcategory:{
            type:String
        },
        productprice: {
            type: Number,
        },
        productimage: {
            type: [String],
        },
    }],
    walletbalance:{
        type:Number,
        default:0
    },
    wallethistory:[{
        process:{
            type:String
        },
        amount:{
            type:Number
        },
        date:{
            type:Date,
            default:Date.now
        }
    }],
    referralCode:{
        type:String,
        unique:true
    },
    referedBy:{
        type:String
    },
    referralLink:{
        type:String
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
    