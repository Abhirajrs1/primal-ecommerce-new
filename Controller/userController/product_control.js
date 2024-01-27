const Product = require('../../Model/product')
const User = require('../../Model/user')
const Category = require('../../Model/category')
const Order = require('../../Model/orders')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')
const mongoose = require('mongoose')


const productView = async (req, res) => {
    try {
        const user = await User.findOne({ useremail: req.session.user });
        const id = req.query.id;
        const product_id = new mongoose.Types.ObjectId(id)
        const data=await Product.aggregate([
            {$match:{_id:product_id}},
            {
                $lookup:
                {
                    from:'offers',
                    localField:'name',
                    foreignField:'productName',
                    as:'productOffer'
                },
            },
            {
                $lookup:
                {
                    from:'offers',
                    localField:'categoryname',
                    foreignField:'categoryName',
                    as:'categoryOffer'
                },  
            }
        ])
        if (user) {
            res.render('userviews/productview', { useremail: req.session.user, data,user })
        } else {
            res.render('userviews/productview', { useremail: req.session.user, data,user })
        }
    } catch (error) {
        console.log("detaild page error" + error)
        const message = error.message
        res.status(500).render('404-error', { error: 500, message: 'Internal Server Error' });
    }
}

const productlist=async(req,res)=>{
    try {
        const ITEMS_PER_PAGE = 9;
        const user = await User.findOne({ useremail: req.session.user });
        const page = +req.query.page || 1; 
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const data=await Product.aggregate([
            {
                $lookup : 
                {
                    from : 'offers', 
                    localField : "name", 
                    foreignField : "productName", 
                    as : "productOffer"
                }
            },
            {
                $lookup : 
                {
                    from : 'offers', 
                    localField : 'categoryname',
                    foreignField : "categoryName", 
                    as : 'categoryOffer'
                }
            }]) .skip(skip)
            .limit(ITEMS_PER_PAGE);

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

        const category=await Category.find({})
        res.render('userviews/productlist',{user,data,category,page,totalPages})     
    } catch (error) {
        console.log(error);      
    }
}

const search_userProduct=async(req,res)=>{
    try {
        const ITEMS_PER_PAGE = 9;
        const page = +req.query.page || 1; 
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const user = await User.findOne({ useremail: req.session.user });
        const category=await Category.find({})
        const search=req.body.search
        const data=await Product.aggregate([
            {$match:{name:{$regex:new RegExp(search,'i')}}},
            {
                $lookup:
                {
                    from:'offers',
                    localField:'name',
                    foreignField:'productName',
                    as:'productOffer'
                },
            },
            {
                $lookup:
                {
                    from:'offers',
                    localField:'categoryname',
                    foreignField:'categoryName',
                    as:'categoryOffer'
                },  
            }
        ]).skip(skip)
        .limit(ITEMS_PER_PAGE);

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

        res.render('userviews/productlist',{data,user,category,page,totalPages})
    } catch (error) {
        console.log(error)
        
    }

}

const category_filter=async(req,res)=>{
    try {
        const ITEMS_PER_PAGE = 9;
        const page = +req.query.page || 1; 
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const user=await User.findOne({useremail:req.session.user})
        const category=await Category.find({})
        const cat=req.body.category
        const data=await Product.aggregate([
            {$match:{categoryname:cat}},
            {
                $lookup:
                {
                    from:'offers',
                    localField:'name',
                    foreignField:'productName',
                    as:'productOffer'
                },
            },
            {
                $lookup:
                {
                    from:'offers',
                    localField:'categoryname',
                    foreignField:'categoryName',
                    as:'categoryOffer'
                },  
            }
        ]).skip(skip)
        .limit(ITEMS_PER_PAGE);

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        res.render('userviews/productlist',{data,user,category,page,totalPages})
    } catch (error) {
        console.log(error)
    }
}

const price_filter=async(req,res)=>{
    try {
        const ITEMS_PER_PAGE = 9;
        const page = +req.query.page || 1; 
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const user=await User.findOne({useremail:req.session.user})
        const category=await Category.find({})
        const selectedPriceRange=req.body.priceRange
        let minPrice, maxPrice;
        switch (selectedPriceRange) {
            case '1000-1999':
                minPrice = 1000;
                maxPrice = 1999;
                break;
            case '2000-2999':
                minPrice = 2000;
                maxPrice = 2999;
                break;
            case '3000-3999':
                minPrice = 3000;
                maxPrice = 3999;
                break;
            case '4000-4999':
                minPrice = 4000;
                maxPrice = 4999;
                break;
            case '5000-5999':
                minPrice = 5000;
                maxPrice = 5999;
                break;
            
        }
       
        const data=await Product.aggregate([
            {$match:{price: { $gte: minPrice, $lte: maxPrice }}},
            {
                $lookup:
                {
                    from:'offers',
                    localField:'name',
                    foreignField:'productName',
                    as:'productOffer'
                },
            },
            {
                $lookup:
                {
                    from:'offers',
                    localField:'categoryname',
                    foreignField:'categoryName',
                    as:'categoryOffer'
                },  
            }
        ]).skip(skip)
        .limit(ITEMS_PER_PAGE);

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        res.render('userviews/productlist', {data,user,category,page,totalPages});

    } catch (error) {
        console.log(error)
    }
}


module.exports={
    productView,
    productlist,
    search_userProduct,
    category_filter,
    price_filter
}
