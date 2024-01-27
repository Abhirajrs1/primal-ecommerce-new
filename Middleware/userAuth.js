const express = require('express')
const userModel = require('../Model/user')
const Product = require('../Model/product')

// login middleware

const isLoggedIn = (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
    }
}

// user checked middleware

const isUser = (req, res, next) => {
    try {
        if (req.session.user) {
            next()
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.error(error);
    }
}

// user blocked middleware

const isBlocked = async (req, res, next) => {
    try {
        const check = await userModel.findOne({ useremail: req.session.user || req.body.email });

        if (req.session.user && !check.block) {
            req.session.destroy((err) => {
                if (err) {
                    res.send(err);
                } else {
                    return res.status(500).render('userviews/login', { error: "User is Blocked" });
                }
            });
        } else {
            next();
        }
    } catch (err) {
        console.log("Err in block", err);
        res.status(502).send("Unknown Error");
    }
};


const isOtp = async (req, res, next) => {
    try {
        if (req.session.otp) {
            res.redirect('/login')
        } else {
            next()
        }
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    isLoggedIn,
    isBlocked,
    isOtp,
    isUser
}
