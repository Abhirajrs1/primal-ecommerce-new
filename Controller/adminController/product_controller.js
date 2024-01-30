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

// show-products

const adminproduct_mgt = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.pagesize) || 10;
        const skip = (page - 1) * limit;
        const product = await Product.find({}).sort({ $natural: -1 }).skip(skip).limit(limit);
        let countpages = Math.ceil(product.length / limit);
    res.render('adminviews/adminproducts', { product,page,limit,countpages, pagepath : 'products'})
    } catch (error) {
        console.log(error); 
    }   
}

// product adding

const admin_addproductmgt = async (req, res) => {
    try {
        const data = await Category.find()
    res.render('adminviews/addproducts', { data, pagepath : 'products' })
    } catch (error) {
        console.log(error);
    }    
}

const admin_postaddproductmgt = async (req, res) => {
    try {
        const files = req.files
        const product = {
            productid: uuidv4(),
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            categoryname: req.body.categoryname,
            stock: req.body.stock,
            image: files.map(file => file.filename)
        }
        await Product.insertMany([product])
        res.redirect('/productmgt')
    } catch (error) {
        res.send(error)
        console.log(error);

    }
}


// edit product

const edit_product = async (req, res) => {
    try {
        const data = await Category.find()
        const old = await Product.findOne({ productid: req.query.id })
        res.render('adminviews/editproducts', { data, old , pagepath : 'products'})
    } catch (error) {
        res.send(error)
    }
}

const edit_productpost = async (req, res) => {
    try {
        const files = req.files
        const updateProduct = await Product.findOneAndUpdate({ productid: req.body.productId },
            {
                $set:
                {
                    name: req.body.name,
                    price: req.body.price,
                    description: req.body.description,
                    categoryname: req.body.categoryname,
                    stock: req.body.stock,
                    productOffer:req.body.discount,
                    image: files.map(file => file.filename)
                }
            })

        res.redirect('/productmgt')
    } catch (error) {
        console.log(error)
    }
}

// listAndUnlist-product

const unlistandlist = async (req, res) => {
    try {
        const product = await Product.findOne({ productid: req.query.id })
        const unlist = product.unlist
        if (unlist) {
            await Product.updateOne({ productid: req.query.id }, { $set: { unlist: false } })
        } else {
            await Product.updateOne({ productid: req.query.id }, { $set: { unlist: true } })
        }
        res.redirect('/productmgt')
    } catch (error) {
        console.log(error);
    }
}

// search-product

const search_product = async (req, res) => {
    try {
        const search = req.body.search
        const product = await Product.find({ name: { $regex: new RegExp(search, 'i') } })
        res.render('adminviews/adminproducts', { product,pagepath:'products'})
    } catch (error) {
        console.log(error)
    }
}

module.exports={
    adminproduct_mgt,
    admin_addproductmgt,
    admin_postaddproductmgt,
    edit_product,
    edit_productpost,
    unlistandlist,
    search_product
}