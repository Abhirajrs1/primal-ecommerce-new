const Product = require('../../Model/product')
const User = require('../../Model/user')
const Order = require('../../Model/orders')
const Coupon = require('../../Model/coupon')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')
const pdfDoc = require('pdfkit');
require('dotenv').config();
const Razorpay = require('razorpay')
const { RAZORPAY_KEY_ID, RAZORPAY_KEYSECRET } = process.env





const checkout = async (req, res) => {
    const user = await User.findOne({ useremail: req.session.user })
    const coupons=await Coupon.find({enable:true})
    const address = user.useraddress
    const cart = user.cart
    const wallet=user.walletbalance
    res.render('userviews/checkout', { address, cart, user: req.session.user,coupons,wallet})
}


const post_checkout = async (req, res) => {
    try {

        const user = await User.findOne({ useremail: req.session.user });
        const address = user.useraddress.filter(each => each.id == req.body.address);
        const paymentmethod = req.body.payment;
        const item = user.cart;
        const wallet=user.walletbalance
        const razorpayInstance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEYSECRET
        })
        let discountedTotal=req.session.discountedTotal
        const totalToUse=discountedTotal||req.body.total[0]

        const data = {
            orderid: uuidv4(),
            email: req.session.user,
            orderitems: item,
            total:Number(totalToUse),
            deliveryaddress: address[0],
            paymentmethod: req.body.payment
        };


        if (paymentmethod === "COD") {
            const data = {
                orderid: uuidv4(),
                email: req.session.user,
                orderitems: item,
                total: Number(totalToUse),
                deliveryaddress: address[0],
                paymentmethod: req.body.payment
            };
            await Order.insertMany([data]);
            await User.updateOne({ useremail: req.session.user }, { $set: { cart: [] } });
            let quantity;
            for (let i = 0; i < item.length; i++) {
                quantity = item[i].productquantity;
                await Product.updateOne({ productid: item[i].productid }, { $inc: { stock: -quantity } });
            }
            res.send({paymentmethod:'COD',success:true})

        } else if (paymentmethod === "Online") {
            const options = {
                amount:Number(totalToUse*100),
                currency: 'INR',
                receipt: 'razorUser@gmail.com'
            };
            razorpayInstance.orders.create(options, (err, order) => {
                if (!err) {
                    res.status(200).send({
                        success: true,
                        msg: 'Order Created',   
                        order_id: order.id,
                        amount: Number(totalToUse*100),
                        key_id: RAZORPAY_KEY_ID,
                        data: data,
                        contact: "9745151981",
                        name: "Abhiraj RS",
                        email: "abhirajrs1998@gmail.com",
                        paymentmethod: "Online"
                    });

                } else {
                    console.log()
                    res.status(400).send({success:false,msg:"Error creating Razorpay order"});
                }
            });
        }else if(paymentmethod==="Wallet"){
            let totalAmount=Number(totalToUse)
            if(totalAmount<wallet){
                const data = {
                    orderid: uuidv4(),
                    email: req.session.user,
                    orderitems: item,
                    total: totalAmount,
                    deliveryaddress: address[0],
                    paymentmethod: req.body.payment
                };
                let updatedAmount=wallet-totalAmount
                await User.updateOne({useremail:req.session.user},{$set:{walletbalance:updatedAmount}})
                await User.updateOne({useremail:req.session.user},{$push:{wallethistory:{process:"Order Deduction",amount:Number(totalAmount),date:new Date()}}})
                await Order.insertMany([data]);
                await User.updateOne({ useremail: req.session.user }, { $set: { cart: [] } });
                let quantity;
                for (let i = 0; i < item.length; i++) {
                    quantity = item[i].productquantity;
                 await Product.updateOne({ productid: item[i].productid }, { $inc: { stock: -quantity } });
            }
            res.send({paymentmethod:'Wallet',success:true})
        }else{
        res.redirect('/checkout')
        }
    }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server error");
    }

};

const verifyorder=async(req,res)=>{
    try {
        const user=await User.findOne({useremail:req.session.user})
        const item=user.cart
         const data=req.body.data
        await Order.insertMany([data])
        await User.updateOne({useremail:req.session.user},{$set:{cart:[]}})
        let quantity;
        let balance
            for (let i = 0; i < item.length; i++) {
                quantity = item[i].productquantity;
                await Product.updateOne({ productid: item[i].productid }, { $inc: { stock: -quantity } });
            }
            res.status(200).send({
                success:true,
                msg:'Order Created'
            })    
    } catch (error) {
        console.log(error)
        
    }
}
const userorder_success = async (req, res) => {
    const user = await User.findOne({ useremail: req.session.user })
    res.render('userviews/ordersuccess', { user })   
}

const userorders = async (req, res) => {
    const orders = await Order.find({ email: req.session.user }).sort({ $natural: -1 })
    const user = await User.findOne({ useremail: req.session.user })
    res.render('userviews/orders', { orders, user })
}

const cancelorders = async (req, res) => {
    try {
        const cancelorders=await Order.findOne({orderid:req.query.id})
        const orders = await Order.updateOne({ orderid: req.query.id }, { $set: { status: "Cancelled" } })
        if(cancelorders.paymentmethod!="COD"){
            const user=await User.findOne({useremail:req.session.user})
            await User.updateOne({useremail:req.session.user},{$inc:{walletbalance:cancelorders.total}})
            await User.updateOne({useremail:req.session.user},{$push:{wallethistory:{process:"Refund",amount:Number(cancelorders.total),date:new Date()}}})

        }
        const cancelItems=cancelorders.orderitems
        for(let i=0;i<cancelItems.length;i++){
            await Product.updateOne({productid:cancelItems[i].productid},{$inc:{stock:cancelItems[i].productquantity}})
        }
        res.redirect('/orders')
    } catch (error) {
        console.log(error);

    }

}
const returnorders = async (req, res) => {
    try {
        const returnorders=await Order.findOne({orderid:req.query.id})
        const orders = await Order.updateOne({ orderid: req.query.id }, { $set: { status: "Returned" } })
        if(returnorders.paymentmethod!="COD"){
            await User.updateOne({useremail:req.session.user},{$inc:{walletbalance:returnorders.total}})
            await User.updateOne({useremail:req.session.user},{$push:{wallethistory:{process:"Return Refund",amount:Number(returnorders.total),date:new Date()}}})
        }
        const returnItems=returnorders.orderitems
        for(let i=0;i<returnItems.length;i++){
            await Product.updateOne({productid:returnItems[i].productid},{$inc:{stock:returnItems[i].productquantity}})
        }
        res.redirect('/orders')
    } catch (error) {
        console.log(error)
    }
}
const searchorders=async(req,res)=>{
    try {
        
        const user=await User.findOne({useremail:req.session.user})
        const search=req.body.search
        const orders=await Order.find({'orderitems.productname':{$regex:new RegExp(search,'i')}})
        res.render('userviews/orders',{user,orders})
    } catch (error) {
        console.log(error)
    }
}
const couponImplement = async (req, res) => {
    try {
        const user = await User.findOne({ useremail: req.session.user });
        const cart = user.cart;
        const couponCode = req.body.couponCode;
        const total = parseFloat(req.body.total);

        if (!couponCode) {
            return res.json({
                success: false,
                message: 'Please enter a coupon code'
            });
        }

        const coupon = await Coupon.findOne({ couponcode: couponCode });
        
        if (!coupon) {
            return res.json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        if (coupon.expiryDate && new Date() > coupon.expiryDate) {
            return res.json({
                success: false,
                message: 'Coupon has expired'
            });
        }

        if (total < coupon.minimumPrice) {
            return res.json({
                success: false,
                message: `Minimum purchase of ₹${coupon.minimumPrice} required`,
                minimumPrice: coupon.minimumPrice
            });
        }

        const discountAmount = Math.floor(total * parseFloat(coupon.coupondiscount) / 100);
        let discountedTotal;

        if (discountAmount < coupon.maxAmount) {
            discountedTotal = Math.floor(total - discountAmount);
        } else {
            discountedTotal = Math.floor(total - coupon.maxAmount);
        }

        return res.json({
            success: true,
            discountedTotal,
            minimumPrice: coupon.minimumPrice,
            discountAmount: total - discountedTotal,
            message: 'Coupon applied successfully'
        });

    } catch (error) {
        console.error('Coupon implementation error:', error);
        return res.json({
            success: false,
            message: 'Something went wrong. Please try again.'
        });
    }
};
const downloadinvoice = async (req, res) => {
    try {
        const order = await Order.findOne({ orderid: req.query.id });

        const doc = new pdfDoc({ margin: 50 });

        doc.fontSize(18).text('TAX INVOICE', { align: 'center' });
        doc.moveDown();
        doc.lineCap('butt').moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        doc.moveDown();
        doc.fontSize(16).text('ORDER DETAILS', { underline: true });
        doc.moveDown();

        doc.fontSize(12).text(`Order Id: ${order.orderid}`);
        doc.text(`Purchase email: ${order.email}`);
        doc.text(`Date of Delivery: ${order.deliverydate}`);
        doc.text(`Payment Method: ${order.paymentmethod}`);
        doc.text(`Order Status: ${order.status}`);

        // Iterate through products and add details
        doc.moveDown();
        doc.lineCap('butt').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(16).text('PRODUCT DETAILS', { underline: true });

        order.orderitems.forEach((product, index) => {
            doc.moveDown();
            doc.fontSize(12).text(`Product:${index + 1}`,{underline:true});
            doc.text(`Name: ${product.productname}`);
            doc.text(`Price: ${product.productprice}`);
            doc.text(`Quantity: ${product.productquantity}`);
            doc.text(`Subtotal: ${product.productprice * product.productquantity}`);
        });
        // Calculate and display the total price of all products
        const productsTotal = order.orderitems.reduce((total, product) => total + product.productprice * product.productquantity, 0);
        doc.fontSize(14).text(`Total Price:Rs.${productsTotal}/-`, { align: 'right' });

        doc.moveDown();
        doc.lineCap('butt').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(14).text('Thank you for shopping with us!', { align: 'center' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${order.orderid}.pdf`);

        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.log(error);
        res.status(500).send('Error generating the PDF invoice');
    }
};



module.exports={
    checkout,
    post_checkout,
    verifyorder,
    userorder_success,
    userorders, 
    cancelorders,
    returnorders,
    searchorders,
    downloadinvoice,
    couponImplement
}







