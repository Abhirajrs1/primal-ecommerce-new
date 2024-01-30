const express = require("express")
const multer = require('multer')
const router = express()
const session = require('express-session')
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const adminControl = require('../Controller/adminController/admin_control')
const adminCategoryControl=require('../Controller/adminController/category_controller')
const adminProductControl=require('../Controller/adminController/product_controller')
const adminOrderControl=require('../Controller/adminController/order_controller')
const adminCouponControl=require('../Controller/adminController/coupon_controller')
const adminUserControl=require('../Controller/adminController/user_controller')
const adminOfferControl=require('../Controller/adminController/offer_control')
const adminMiddleware = require('../Middleware/adminAuth')
router.use(function (req, res, next) {
  if (!req.user)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});



//multer for the products images upload
const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'productImages'); // Destination 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });




// adminlogin       
router.get('/adminlogin', adminControl.admin_login)
router.post('/adminlogin', adminControl.adminload_login)

// admindashboard
router.get('/admindashboard', adminMiddleware.isAdmin, adminControl.admin_dashboard)
router.get('/report',adminMiddleware.isAdmin,adminControl.report_view)
router.post('/generatepdf',adminMiddleware.isAdmin,adminControl.generatepdf)
router.get('/excel',adminMiddleware.isAdmin,adminControl.excel_view)
router.post('/generateexcel',adminMiddleware.isAdmin,adminControl.generateexcel)

// usermanagament
router.get('/usersmgt', adminMiddleware.isAdmin, adminUserControl.admin_usermgt)
router.get('/blockuser', adminMiddleware.isAdmin, adminUserControl.userblock)
router.post('/searchuser',adminMiddleware.isAdmin,adminUserControl.search_user)

// categorymanagement
router.get('/categorymgt', adminMiddleware.isAdmin, adminCategoryControl.admin_categorymgt)
router.get('/addcategory', adminMiddleware.isAdmin, adminCategoryControl.admin_addcategory)
router.post('/addcategory', adminMiddleware.isAdmin, adminCategoryControl.admin_postaddcategory)
router.get('/editcategory', adminMiddleware.isAdmin, adminCategoryControl.admin_editcategory)
router.post('/editcategory', adminMiddleware.isAdmin, adminCategoryControl.admin_posteditcategory)
router.post('/searchcategory',adminMiddleware.isAdmin,adminCategoryControl.search_category)

// productmanagement
router.get('/productmgt', adminMiddleware.isAdmin, adminProductControl.adminproduct_mgt)
router.get('/addproduct', adminMiddleware.isAdmin, adminProductControl.admin_addproductmgt)
router.post('/addproduct', upload.array('images', 10), adminMiddleware.isAdmin, adminProductControl.admin_postaddproductmgt)
router.get('/editproduct', adminMiddleware.isAdmin,adminProductControl.edit_product)
router.post('/editproduct', upload.array('images', 10), adminMiddleware.isAdmin, adminProductControl.edit_productpost)
router.post('/searchproduct',adminMiddleware.isAdmin,adminProductControl.search_product)
router.get('/listProduct', adminMiddleware.isAdmin, adminProductControl.unlistandlist)

// ordermanagement
router.get('/ordermgt', adminMiddleware.isAdmin, adminOrderControl.ordermgt)
router.get('/orderdetails',adminMiddleware.isAdmin,adminOrderControl.orderdetails)
router.get('/editorderstatus',adminMiddleware.isAdmin,adminOrderControl.edit_orderstatus)
router.post('/searchorders',adminMiddleware.isAdmin,adminOrderControl.search_order)

// couponmanagement
router.get('/coupons',adminMiddleware.isAdmin,adminCouponControl.coupons)
router.get('/addcoupons',adminMiddleware.isAdmin,adminCouponControl.addcoupons)
router.post('/addcoupons',adminMiddleware.isAdmin,adminCouponControl.addcoupon_post)
router.get('/editcoupons',adminMiddleware.isAdmin,adminCouponControl.edit_coupon)  
router.post('/editcoupons',adminMiddleware.isAdmin,adminCouponControl.edit_couponpost) 
router.get('/listcoupon',adminMiddleware.isAdmin,adminCouponControl.listandunlist_coupon) 
router.post('/searchcoupon',adminMiddleware.isAdmin,adminCouponControl.search_coupon)

// offermanagement
router.get('/offermgt',adminMiddleware.isAdmin,adminOfferControl.offerView)
router.get('/addoffer',adminMiddleware.isAdmin,adminOfferControl.addoffer)
router.post('/addoffer',adminMiddleware.isAdmin,adminOfferControl.addoffer_post)
router.get('/editoffer',adminMiddleware.isAdmin,adminOfferControl.editoffer)
router.post('/editoffer',adminMiddleware.isAdmin,adminOfferControl.editoffer_post)
router.get('/enableoffer',adminMiddleware.isAdmin,adminOfferControl.enableanddisableOffer)

// adminlogout
router.get('/adminlogout', adminControl.admin_logout) 

// 404 page
router.all('*', adminControl.error)









module.exports = router