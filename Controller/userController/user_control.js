const bcrypt = require('bcrypt')
const Product = require('../../Model/product')
const User = require('../../Model/user')
const Order = require('../../Model/orders')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config();
const accountsid = process.env.ACCOUNTS_ID
const authToken = process.env.AUTHTOKEN
const client = require('twilio')(accountsid,authToken)


// home
const user_home = async (req, res) => {
    const prodata=await Product.aggregate([
        {$match:{unlist:true}},
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
    const user = await User.findOne({ useremail: req.session.user })
    res.render('userviews/index', { prodata, user })
}


// login
const userlogin = async (req, res) => {
    res.render('userviews/login')
}

const userload_login = async (req, res) => {
    try {
      const check = await User.findOne({ useremail: req.body.email.toLowerCase()});
  
      if (check) {
        if (!req.body.password) {
          return res.render('userviews/login', { error: true, errorMessage:"Password required" });
        }
        const passWordCheck=await bcrypt.compare(req.body.password,check.userpassword)
        if(passWordCheck){
            req.session.user = check.useremail;
          res.redirect('/');
        } else {
          res.render('userviews/login', { error: true, errorMessage:"Incorrect password" });
        }
      } else {
        res.render('userviews/login', { error: true, errorMessage: "User not found" });
      }
    } catch (error) {
      console.log("ERROR", error);
      res.render('userviews/register');
    }
  };


//   user register
const user_register = async (req, res) => {
    const { ref } = req.query;
    if (ref) {
        res.render("userviews/register", { ref })
    } else {
        res.render("userviews/register");
    }
}

const userload_register = async (req, res) => {
    try {
        const newreferralCode = "REF" + generateReferralCode(4)
        const referedCode = req.body.referralCode
        const existingUser = await User.findOne({ useremail: req.body.email })
        if (existingUser) {
            res.render('userviews/register', { msg: "User already registered" })
        } else if (!req.body.name || !req.body.email || !req.body.password || !req.body.number) {
            res.render('userviews/register', { msg: 'All fields are required' })
        } else if(!isValidateName(req.body.name)){
            res.render('userviews/register', { msg: 'Please enter first letter as capital' })    
        } else if(!isValidatePassword(req.body.password)){
            res.render('userviews/register', { msg: 'Must enter only numbers and must have 4 characters' })
        }else if (!isValidEmail(req.body.email)) {
            res.render('userviews/register', { msg: 'Syntax error' })
        }else if (!isValidatePhoneNumber(req.body.number)) {
            res.render('userviews/register', { msg: 'Enter valid phone number' })    
        } else if (req.body.email !== req.body.email.toLowerCase()) {
            res.render('userviews/register', { msg: "Email must be in lowercase" })
        } else {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)

            const data = {
                username: req.body.name,
                useremail: req.body.email,
                userpassword: hashedPassword,
                usercontact: req.body.number,
                referralCode: newreferralCode,
                referedBy: referedCode

            }
            await User.create(data)
            let amount = 10
            let Amount = 50
            if (referedCode) {
                let user = await User.findOne({ useremail: req.body.email })
                await User.updateOne({ useremail: req.body.email }, { $push: { wallethistory: { process: "Referral Offer", amount: amount, date: new Date() } } })
                await User.updateOne({ useremail: req.body.email }, { $inc: { walletbalance: amount } })
            }
            await User.updateOne({ referralCode: referedCode }, { $push: { wallethistory: { process: "Referral Offer", amount: Amount, date: new Date() } } })
            await User.updateOne({ referralCode: referedCode }, { $inc: { walletbalance: Amount } })
            res.redirect('userviews/login')
        }
    } catch (error) {
        res.render('userviews/register', { error: 'An error occured while registering' })
    }
}

// functions for validation start
function isValidateName(name){
    const username=/^[A-Z][a-zA-Z]{7}$/.test(name)
    return username
}

function isValidEmail(email) {
    if (email.includes(' ')) {
        return false;
    }
    if (!email.endWith('@gmail.com')) {
        return false;
    }
    return true
}

function isValidatePassword(password) {
    const containsNumber = /^\d+$/.test(password);
    const hasFourCharacters = password.length === 4;
    return containsNumber && hasFourCharacters;
}

function isValidatePhoneNumber(number){
    const phoneNumber=/^\d{10}/.test(number)
    return phoneNumber
}
// functions for validation end


function generateReferralCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let referralCode = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        referralCode += characters.charAt(randomIndex)
    }
    return referralCode
}

function referral_url(referedCode){
let referrallink = `http://localhost:3500/register?referral=${referralCode}`;
}

// const userload_otp = async (req, res) => {
//     let otp = ''
//     for (let i = 0; i < 4; i++) {
//         otp += Math.floor(Math.random() * 10)
//     }
//     console.log(otp, "OTP");

//     req.session.otp = otp
//     client.messages.create({
//         body: `<#> ${otp} is your verification code `,
//         to: '+919745151981',
//         from: '+12567248180',
//     })
//         .then((message) => console.log(message,"MESSAGE"))
//         .catch((error) => {
//             console.log(error,"ERROR");
//         });
//     res.render('userviews/otp')
// }

// const userpost_otp = async (req, res) => {
//     try {
//         if (req.session.otp === req.body.otp) {
//             req.session.otp = null;
//             await User.updateOne({ useremail: req.session.email }, { $set: { isverified: true } })
//             res.redirect('/')
//         } else {
//             res.render('userviews/otp', { msg: "Incorrect OTP" })
//         }
//     } catch (err) {
//         console.log(err);
//     }

// }
const user_logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.send(err);
        } else {
            res.redirect('/login');
        }
    });
}

const forgotPassword=async(req,res)=>{
    try {
        res.render('userviews/forgotpassword')
    } catch (error) {
        console.log(error);
    }
}

const post_forgotpassword=async(req,res)=>{
    try {
        const check=await User.findOne({username:req.body.username})
        if(check.usercontact==req.body.phoneNumber){
            req.session.temp=req.body.username
            res.redirect('/resetpwotp')
        }
    } catch (error) {
        console.log(error);
    }
}

// const resetpw_otp=async(req,res)=>{
//     let otp = ''
//     for (let i = 0; i < 4; i++) {
//         otp += Math.floor(Math.random() * 10)
//     }
//     console.log(otp, "OTP");

//     req.session.otp = otp
//     client.messages.create({
//         body: `<#> ${otp} is your verification code `,
//         to: '+919745151981',
//         from: '+12567248180',
//     })
//         .then((message) => console.log(message,"MESSAGE"))
//         .catch((error) => {
//             console.log(error,"ERROR");
//         });
//     res.render('userviews/passwordotp')
// }

// const post_resetpwotp=async(req,res)=>{
//     try {
//         if(req.session.otp===req.body.otp){
//             res.redirect('/resetpassword')
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }
const reset_password=async(req,res)=>{
    try {
        res.render('userviews/resetpassword')
    } catch (error) {
        console.log(error);
    }
}

const post_resetpassword=async(req,res)=>{
    try {
        if(!req.body.newPassword||!req.body.confirmPassword){
            res.render('userviews/resetpassword',{msg:"All fields required"})
        }else if(req.body.newPassword!=req.body.confirmPassword){
            res.render('userviews/resetpassword',{msg:"Password not match"})
        }else{
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
            await User.updateOne({ username: req.session.temp }, { $set: { userpassword: hashedPassword } });
        res.redirect('/login')
        } 
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    user_home,
    userlogin,
    userload_login,
    user_register,
    userload_register,
    // userload_otp,
    // userpost_otp,
    user_logout,
    forgotPassword,
    post_forgotpassword,
    // resetpw_otp,
    // post_resetpwotp,
    reset_password,
    post_resetpassword
    
}