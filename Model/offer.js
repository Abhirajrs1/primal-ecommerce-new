const mongoose=require('mongoose')
const offerSchema=new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    productName:{
        type:String,
        required:true
    },
    discount:{
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
    enable:{
        type:Boolean,
        default:true
    }
})
const Offer=new mongoose.model('Offer',offerSchema)
module.exports=Offer