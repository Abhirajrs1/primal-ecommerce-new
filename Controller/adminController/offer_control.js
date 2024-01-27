const path = require('path')
const Admin = require('../../Model/admin')
const Category = require('../../Model/category')
const Product = require('../../Model/product')
const User = require('../../Model/user')
const Order = require('../../Model/orders')
const Coupon = require('../../Model/coupon')
const Offer = require('../../Model/offer')
const { v4: uuidv4 } = require('uuid')
const session = require('express-session')

// viewoffer

const offerView = async (req, res) => {
    try {
        let offer = await Offer.find({})
        res.render('adminviews/adminoffers', { offer, pagepath: 'offers' })
    } catch (error) {
        console.log(error);
    }
}

// addoffer

const addoffer = async (req, res) => {
    try {
        let data = await Category.find({})
        let product = await Product.find({})
        res.render('adminviews/addoffer', { data, product, pagepath: 'offers' })
    } catch (error) {
        console.log(error);
    }
}
const addoffer_post = async (req, res) => {
    try {
        let data = await Category.find({})
        let product = await Product.find({})
        let addBy = req.body.addBy
        let offer
        if (addBy == 'product') {
            const existingProduct = await Offer.findOne({ productName: req.body.product })
            if (existingProduct) {
                return res.render('adminviews/addoffer', { data, product, msg: "Offer already added" })
            } else {
                offer = {
                    productName: req.body.product,
                    discount: req.body.discount,
                    count: req.body.count,
                    expiryDate: req.body.expiryDate
                }
            }
        } else if (addBy == 'category') {
            const existingCategory = await Offer.findOne({ categoryName: req.body.category })
            if (existingCategory) {
                return res.render('adminviews/addoffer', { data, product, msg: "Offer already added" })
            } else {
                offer = {
                    categoryName: req.body.category,
                    discount: req.body.discount,
                    expiryDate: req.body.expiryDate
                }
            }
        }
        await Offer.insertMany([offer])
        res.redirect('/offermgt')
    } catch (error) {
        console.log(error);
    }
}

// edit-offer

const editoffer = async (req, res) => {
    try {
        let offer = await Offer.findOne({ _id: req.query.id })
        res.render('adminviews/editoffer', { offer, pagepath: 'offers' })
    } catch (error) {
        console.log(error);
    }
}
const editoffer_post = async (req, res) => {
    try {
        const updateoffer = await Offer.findOneAndUpdate({ _id: req.body.id }, {
            $set: {
                discount: req.body.discount,
                expiryDate: req.body.expiryDate
            }
        })
        res.redirect('/offermgt')
    } catch (error) {
        console.log(error);
    }
}

// listandunlistoffer
const enableanddisableOffer = async (req, res) => {
    try {
        const offer = await Offer.findOne({ _id: req.query.id })
        const enable = offer.enable
        if (enable) {
            await Offer.updateOne({ _id: req.query.id }, { $set: { enable: false } })
        } else {
            await Offer.updateOne({ _id: req.query.id }, { $set: { enable: true } })
        }
        res.redirect('/offermgt')
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    offerView,
    addoffer,
    addoffer_post,
    editoffer,
    editoffer_post,
    enableanddisableOffer
}