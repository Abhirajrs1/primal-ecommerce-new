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
const moment=require('moment')
// coupon-view

const coupons = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.pagesize) || 10;
        const skip = (page - 1) * limit;
        const coupon = await Coupon.find({}).sort({ $natural: -1 }).skip(skip).limit(limit);
        let countpages = Math.ceil(coupon.length / limit);
        res.render('adminviews/admincoupons', { coupon, limit, page, countpages, pagepath: 'coupons' })

    } catch (error) {
        console.log(error)
    }
}

// add-coupons

const addcoupons = async (req, res) => {
    try {
        res.render('adminviews/addcoupons', { pagepath: 'coupons' })
    } catch (error) {
        console.log(error)
    }
}
const addcoupon_post = async (req, res) => {
    try {
        const couponName = req.body.couponName;
        const couponCode = req.body.couponCode;
        const existingCoupon=await Coupon.findOne({
            $or: [
                { couponname: { $regex: new RegExp('^'+couponName+'$', 'i') } },
                { couponcode: { $regex: new RegExp('^'+couponCode+'$', 'i') } }
            ]
        })
        if(existingCoupon){
           return res.render('adminviews/addcoupons',{msg:"Coupon with same name/code already exists"})
        }
        const coupon = {
            couponid: uuidv4(),
            couponname: req.body.couponName,
            couponcode: req.body.couponCode,
            coupondiscount: req.body.offerPercentage,
            expiryDate: req.body.expiryDate,
            maxAmount: req.body.maxOff,
        }
        await Coupon.insertMany([coupon])
        res.redirect('/coupons')
    } catch (error) {
        console.log(error)
    }
}

// edit-coupons

const edit_coupon = async (req, res) => {
    try {
        const data = await Coupon.findOne({ couponid: req.query.id })
        res.render('adminviews/editcoupons', { data, pagepath: 'coupons' })
    } catch (error) {
        console.log(error);
    }
}
const edit_couponpost = async (req, res) => {
    try {
        const updateCoupon = await Coupon.findOneAndUpdate({ couponid: req.body.couponId },
            {
                $set:
                {
                    couponname: req.body.couponName,
                    couponcode: req.body.couponCode,
                    coupondiscount: req.body.offerPercentage,
                    expiryDate: req.body.expiryDate,
                    maxAmount: req.body.maxOff,
                    count: req.body.couponCount,

                }
            } ,
            { new: true } 
            )
        res.redirect('/coupons')
    } catch (error) {
        console.log(error);
    }
}

// couponlistandunlist

const listandunlist_coupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ couponid: req.query.id })
        const enable = coupon.enable
        if (enable) {
            await Coupon.updateOne({ couponid: req.query.id }, { $set: { enable: false } })
        } else {
            await Coupon.updateOne({ couponid: req.query.id }, { $set: { enable: true } })
        }
        res.redirect('/coupons')
    } catch (error) {
        console.log(error)

    }
}

const search_coupon=async (req,res)=>{
    try {
        const search = req.body.search
        const coupon=await Coupon.find({couponname:{$regex:new RegExp(search,'i')}})
        res.render('adminviews/admincoupons',{coupon})
    } catch (error) {
        console.log(error);
    }
}




module.exports = {
    coupons,
    addcoupons,
    addcoupon_post,
    edit_coupon,
    edit_couponpost,
    listandunlist_coupon,
    search_coupon
}