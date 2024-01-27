const User=require('../../Model/user')
const { v4: uuidv4 } = require('uuid')
const moment=require('moment')

// wallet showing
const walletshow=async(req,res)=>{ 
    try {
        const user=await User.findOne({useremail:req.session.user})
        const wallet=user.walletbalance
        res.render('userviews/wallet',{user,wallet})
    } catch (error) {
        console.log(error);
    }   
}

const wallet_post = async (req, res) => {
    try {
        const user=await User.findOne({useremail:req.session.user})
        const topUp=req.body.amount
        let wallet=user.walletbalance
        wallet+=Number(topUp)
        await User.updateOne({useremail:req.session.user},{$set:{walletbalance:wallet}},)
        await User.updateOne({useremail:req.session.user},{$push:{wallethistory:{process:"Topup",amount:Number(topUp),date:new Date()}}})
        res.redirect('/wallet')
    } catch (error) {
        console.log(error);
    }
   
};

// wallet history
const wallethistory=async(req,res)=>{
    try {
        const user=await User.findOne({useremail:req.session.user})
        const wallethistory=user.wallethistory
        res.render('userviews/wallethistory',{user,wallethistory,moment})
    } catch (error) {
        console.log(error);
    }
}


    

module.exports={
    walletshow,
    wallet_post,
    wallethistory
}