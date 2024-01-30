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

// show-orders

const ordermgt = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.pagesize) || 10;
        const skip = (page - 1) * limit;
        const orders = await Order.find({}).sort({ $natural: -1 }).skip(skip).limit(limit);
        let countpages = Math.ceil(orders.length / limit);
        res.render('adminviews/adminorders', { orders, page, limit, countpages, pagepath: 'orders' })
    } catch (error) {
        console.log(error);

    }

}

// detailsoforder

const orderdetails = async (req, res) => {
    const orderdetails = await Order.findOne({ orderid: req.query.id })
    res.render('adminviews/orderdetails', { orderdetails, pagepath: 'orders' })
}

// edit_orderstatus

const edit_orderstatus = async (req, res) => {
    try {
        let updatedStatus;
        if (req.query.cancel) {
            updatedStatus = "Cancelled"
        } else if (req.query.deliver) {
            updatedStatus = "Delivered"
        } else if (req.query.transit) {
            updatedStatus = "Transit"
        }

        const order = await Order.findOneAndUpdate({ orderid: req.query.cancel || req.query.deliver || req.query.transit },
            { status: updatedStatus },
            { new: true })

        const orderdetails = await Order.findOne({ orderid: req.query.cancel || req.query.deliver || req.query.transit })
        res.render('adminviews/orderdetails', { order, orderdetails })
    } catch (error) {
        console.log(error)
    }
}

const search_order=async(req,res)=>{
    try {
        const search=req.body.search
        const orders=await Order.find({status:{$regex:new RegExp(search,'i')}})
        res.render('adminviews/adminorders',{orders,pagepath:'orders'})
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    ordermgt,
    orderdetails,
    edit_orderstatus,
    search_order
}