const multer = require('multer')
const path = require('path')
const Admin = require('../../Model/admin')
const Category = require('../../Model/category')
const Product = require('../../Model/product')
const User = require('../../Model/user')
const Order = require('../../Model/orders')
const Coupon = require('../../Model/coupon')
const { v4: uuidv4 } = require('uuid')
const session = require('express-session')

// Show users

const admin_usermgt = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.pagesize) || 10;
        const skip = (page - 1) * limit;
        const data = await User.find({}).sort({ $natural: -1 }).skip(skip).limit(limit);
        let countpages = Math.ceil(data.length / limit);

    res.render('adminviews/adminusers', { data,page,limit,countpages,pagepath : 'users'  })
    } catch (error) {
        console.log(error);
    }  
}

// user-block&unblock

const userblock = async (req, res) => {
    try {   
        const user = await User.findOne({ useremail: req.query.email })
        const block = user.block
        if (block) {
            await User.updateOne({ useremail: req.query.email }, { $set: { block: false } })
        } else {
            await User.updateOne({ useremail: req.query.email }, { $set: { block: true } })
        }
        res.redirect('/usersmgt')

    } catch (error) {
        console.log(error);
    }
}

const search_user=async(req,res)=>{
    try {
        const search=req.body.search
        const data=await User.find({username:{$regex:new RegExp(search,'i')}})
        res.render('adminviews/adminusers',{data,pagepath:'users'})
    } catch (error) {
        console.log(error);
    }
}



module.exports={
    admin_usermgt,
    userblock,
    search_user
}