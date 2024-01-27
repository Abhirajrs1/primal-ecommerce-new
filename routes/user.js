const express = require("express")
const router = express()
const session = require('express-session')
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const userControl=require('../Controller/userController/user_control')
const productControl=require('../Controller/userController/product_control')
const cartAndWishlistContol=require('../Controller/userController/cartAndWishlist_control')
const orderControl=require('../Controller/userController/order_control')
const profileControl=require('../Controller/userController/profile_contol')
const walletControl=require('../Controller/userController/wallet_control')
const userMiddleware = require('../Middleware/userAuth')


router.use(function (req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// checkuserisBlocked/Unblock
router.get('/',userMiddleware.isBlocked,userControl.user_home)  

// userLogin
router.get('/login', userMiddleware.isLoggedIn, userControl.userlogin)
router.post('/login',userMiddleware.isBlocked,userControl.userload_login) 

// userRegister
router.get('/register', userMiddleware.isLoggedIn, userControl.user_register)
router.post('/register', userControl.userload_register)

// forgotPassword
router.get('/forgotpassword',userControl.forgotPassword)
router.post('/forgotpassword',userControl.post_forgotpassword)

// otp for resetpassword
router.get('/resetpwotp',userControl.resetpw_otp)
router.post('/resetpwotp',userControl.post_resetpwotp)

// resetpassword
router.get('/resetpassword',userControl.reset_password)
router.post('/resetpassword',userControl.post_resetpassword)

// otpforsignup
router.get('/otp', userMiddleware.isOtp, userControl.userload_otp)
router.post('/otp',userControl.userpost_otp)

// userside product
router.get('/product-view',productControl.productView)
router.get('/productlist',productControl.productlist)
router.post('/search_userproduct',productControl.search_userProduct)
router.post('/categoryfilter',productControl.category_filter)
router.post('/pricefilter',productControl.price_filter)

// cart
router.get('/addtocart/:id', userMiddleware.isUser,cartAndWishlistContol.user_addcart)
router.get('/cart', userMiddleware.isUser, cartAndWishlistContol.user_cart)
router.get('/increasequantity', cartAndWishlistContol.increasequantity)
router.get('/decreasequantity', cartAndWishlistContol.decreasequantity)
router.get('/deletecart', userMiddleware.isUser,cartAndWishlistContol.deletecart)
router.get('/wishlist',userMiddleware.isUser,cartAndWishlistContol.wishlist)
router.get('/addtowishlist/:id',userMiddleware.isUser,cartAndWishlistContol.addwishlist)
router.get('/deletewishlist',userMiddleware.isUser,cartAndWishlistContol.deletewishlist)

// checkout related
router.get('/checkout', userMiddleware.isUser, orderControl.checkout)
router.post('/checkout', userMiddleware.isUser, orderControl.post_checkout)
router.get('/orders', userMiddleware.isUser, orderControl.userorders)
router.get('/cancelorders', userMiddleware.isUser, orderControl.cancelorders)   
router.get('/returnorders',userMiddleware.isUser,orderControl.returnorders)
router.post('/verifyorder',userMiddleware.isUser,orderControl.verifyorder)
router.get('/ordersuccess',userMiddleware.isUser,orderControl.userorder_success)
router.post('/search_orders',userMiddleware.isUser,orderControl.searchorders)
router.get('/downloadinvoice',orderControl.downloadinvoice)
router.post('/couponImplement',orderControl.couponImplement)

// wallet
router.get('/wallet',walletControl.walletshow)
router.post('/wallet',walletControl.wallet_post)
router.get('/wallethistory',walletControl.wallethistory)

// userprofile
router.get('/addaddress', userMiddleware.isUser, profileControl.addaddress)
router.post('/addaddress', userMiddleware.isUser, profileControl.addpost_address)
router.get('/userdetails',userMiddleware.isUser, profileControl.userdetails)
router.get('/userprofile',userMiddleware.isUser, profileControl.userprofile)
router.get('/editprofile',userMiddleware.isUser, profileControl.editprofile)
router.post('/editprofile',userMiddleware.isUser, profileControl.editprofile_post)
router.get('/editaddress',userMiddleware.isUser,profileControl.edit_address)
router.post('/editaddress',userMiddleware.isUser,profileControl.edit_address_post)
router.get('/deleteaddress',userMiddleware.isUser,profileControl.delete_address)

// userlogout
router.get('/logout', userControl.user_logout)


module.exports = router