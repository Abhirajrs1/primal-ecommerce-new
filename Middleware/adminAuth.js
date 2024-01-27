const express = require('express')          

// check isAdmin

const isAdmin = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/adminlogin')
    }
}


module.exports = {
    isAdmin
}