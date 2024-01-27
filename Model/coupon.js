const mongoose=require('mongoose')
const couponSchema=new mongoose.Schema({
    couponid:{
        type:String,
        required:true
    },
    couponname:{
        type:String,
        required:true
    },
    couponcode:{
        type:String,
        required:true
    },
    coupondiscount:{
        type:Number,
        required:true
    },
    expiryDate:{
        type:Date,
        default:function(){
            const currentDate=new Date()
            currentDate.setHours(0,0,0,0)
            return currentDate

        },
        get:function(val){
            return val ? new Date(val).toLocaleDateString('en-GB') : '';
        }
    },
    maxAmount:{
        type:Number,
        required:true
    },
    enable:{
        type:Boolean,
        default:true
    }
})
const Coupon=new mongoose.model('Coupon',couponSchema)
module.exports=Coupon