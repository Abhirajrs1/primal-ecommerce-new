const Product = require('../../Model/product')
const User = require('../../Model/user')
const Order = require('../../Model/orders')
const Coupon = require('../../Model/coupon')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')


// addNewAddress
const addaddress = async (req, res) => {
    const user = await User.findOne({ useremail: req.session.user })
    const wallet=user.walletbalance
    res.render('userviews/addaddress', { user,wallet })
}

const addpost_address = async (req, res) => {
    try {
        const user = await User.findOne({ useremail: req.session.user })
        if (!user) {
            res.send("User not found")
        } else {
            const data = {
                id: uuidv4(),
                name: req.body.name,
                housenumber: req.body.housenumber,
                area: req.body.area,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode
            }
            await User.updateOne({ useremail: req.session.user }, { $push: { useraddress: data } }, { new: true })
            const user = await User.findOne({ useremail: req.session.user })
            const wallet=user.walletbalance
            const coupons=await Coupon.find({})
            const address = user.useraddress
            const cart = user.cart
            res.render('userviews/checkout', { address, cart, data, user: req.session.user,wallet,coupons })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Error");

    }
}




const userdetails = async (req, res) => {
    const user = await User.findOne({ useremail: req.session.user })
    const address = user.useraddress
    res.render('userviews/userdetails', { user, address })
}

const userprofile = async (req, res) => {
    const user = await User.findOne({ useremail: req.session.user })
    const wallet=user.walletbalance
    res.render('userviews/userprofile', { user,wallet})
}
const editprofile = async (req, res) => {
    const user = await User.findOne({ useremail: req.query.id })
    res.render('userviews/editprofile', { user })
}

const editprofile_post = async (req, res) => {
    try {
        const data = {
            username: req.body.fullName,
            useremail: req.body.email,
            usercontact: req.body.mobileNumber
        }
        const updateddata = await User.findOneAndUpdate({ useremail: req.query.id }, { $set: data })
        res.redirect('/userdetails')

    } catch (error) {
        console.log(error);

    }

}

const edit_address=async(req,res)=>{
    try {
        const user=await User.findOne({useremail:req.session.user,'useraddress.id':req.query.id})
        res.render('userviews/editaddress',{user})
    } catch (error) {
        console.log(error);
    }
}

const edit_address_post=async(req,res)=>{
    try {
        const data={
            'useraddress.$.name': req.body.name,
            'useraddress.$.housenumber': req.body.housenumber,
            'useraddress.$.area': req.body.area,
            'useraddress.$.city': req.body.city,
            'useraddress.$.state': req.body.state,
            'useraddress.$.pincode': req.body.pincode
        }
        await User.findOneAndUpdate({useremail:req.session.user,'useraddress.id':req.body.id},{$set:data})
        res.redirect('/userdetails')
    } catch (error) {
        console.log(error);
    }
}
const delete_address=async(req,res)=>{
    try {
        await User.findOneAndUpdate({useremail: req.session.user, 'useraddress.id':req.query.id},{$pull:{useraddress:{id:req.query.id}}})
        res.redirect('/userdetails')
    } catch (error) {
        console.log(error);
    }
}

module.exports={
    addaddress,
    addpost_address,
    userdetails,
    userprofile,
    editprofile,
    editprofile_post,
    edit_address,
    edit_address_post,
    delete_address

}