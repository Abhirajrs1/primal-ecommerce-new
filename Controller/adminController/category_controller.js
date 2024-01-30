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


// categoryview

const admin_categorymgt = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.pagesize) || 10;
        const skip = (page - 1) * limit;
        const data = await Category.find({}).sort({ $natural: -1 }).skip(skip).limit(limit);
        let countpages = Math.ceil(data.length / limit);

        res.render('adminviews/admincategory', { data, page, limit, countpages, pagepath: 'category' })
    } catch (error) {
        console.log(error);
    }

}

// add category

const admin_addcategory = async (req, res) => {
    try {
        res.render('adminviews/addcategory', { pagepath: 'category' })
    } catch (error) {
        console.log(error)
    }

}
const admin_postaddcategory = async (req, res) => {
    try {
        const categoryName = req.body.categoryName.toLowerCase();
        const category = await Category.findOne({ categoryname: { $regex: new RegExp('^' + categoryName + '$', 'i') } });
        if (category) {
            res.render('adminviews/addcategory', { err: 'Category already exist' })

        } else if (!req.body.categoryName || !req.body.categoryDescription) {
            res.render('adminviews/addcategory', { err: "Required all fields" })
        }
        else {
            const data = {
                categoryid: uuidv4(),
                categoryname: req.body.categoryName,
                categorydescription: req.body.categoryDescription
            }

            await Category.insertMany([data])
            res.render('adminviews/addcategory', { msg: "Category added successfully" })

        }
    } catch (error) {
        console.log(error);
    }

}

// edit category

const admin_editcategory = async (req, res) => {
    try {
        const oldData = await Category.findOne({ categoryid: req.query.id })
        res.render('adminviews/editcategory', { oldData, pagepath: 'category' })
    } catch (e) {
        res.send(e)
    }
}

const admin_posteditcategory = async (req, res) => {
    try {

        const existingCategory = await Category.findOne({
            $and: [
                { categoryname: { $regex: new RegExp(`^${req.body.categoryName}$`, 'i') } },
                { categoryid: { $ne: req.body.categoryId } }
            ]
        });
        if (existingCategory) {
            return res.status(400).render('adminviews/addcategory', { err: 'Category already exists.' });
        } else {
            const updateCategory = await Category.findOneAndUpdate({ categoryid: req.body.categoryId },
                {
                    $set:
                    {
                        categoryname: req.body.categoryName,
                        categorydescription: req.body.categoryDescription
                    }
                })
            res.redirect('/categorymgt')
        }
    } catch (error) {
        console.log(error)
    }
}

// search category

const search_category = async (req, res) => {
    try {
        const search = req.body.search
        const data = await Category.find({ categoryname: { $regex: new RegExp(search, 'i') } })
        res.render('adminviews/admincategory', { data ,pagepath:'category'})
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    admin_categorymgt,
    admin_addcategory,
    admin_postaddcategory,
    admin_editcategory,
    admin_posteditcategory,
    search_category
}