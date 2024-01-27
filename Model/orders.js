const mongoose = require('mongoose')
const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};
const orderSchema = new mongoose.Schema({
    orderid: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    orderitems: [{
        productid: {
            type: String,
            required:true
        },
        productname: {
            type: String,
            required:true
        },
        productprice: {
            type: Number,
            required:true
        },
        productimage: {
            type: [String],
            required:true
        },
        productquantity: {
            type: Number,
            required:true
        },
        productcategory: {
            type: String,
            required:true
        },

    }],
    status: {
        type: String,
        default: 'Placed',
        required:true
    },
    total: {
        type: Number,
        required:true
    },
    purchasedate: {
        type: Date,
        default: new Date,
        get: formatDate

    },
    deliverydate: {
        type: Date,
        default: function () {
            const deliveryDate = new Date(this.purchasedate);
            deliveryDate.setDate(deliveryDate.getDate() + 10);
            return deliveryDate;
        },
        get: formatDate
    },
    expirydate:{
        type:Date,
        default:function(){
            const expiryDate=new Date(this.purchasedate);
            expiryDate.setDate(expiryDate.getDate()+30)
            return expiryDate
        },
        get:formatDate
    },
    deliveryaddress: {

        type: {
            id : {
                type : String,
                required : true
            },
            name: {
                type: String,
                required:true
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
        }
    },
    paymentmethod: {
        type: String
    },
})
const Orders = new mongoose.model('Order', orderSchema)
module.exports = Orders







