const Product = require('../../Model/product')
const User = require('../../Model/user')
const Order = require('../../Model/orders')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')


const user_addcart = async (req, res) => {
    try {
        const user = await User.findOne({ useremail: req.session.user });
        const data = await Product.aggregate([
            { $match: { productid: req.params.id } },
            {
                $lookup:
                {
                    from: 'offers',
                    localField: 'name',
                    foreignField: 'productName',
                    as: 'productOffer'
                },
            },
            {
                $lookup:
                {
                    from: 'offers',
                    localField: 'categoryname',
                    foreignField: 'categoryName',
                    as: 'categoryOffer'
                },
            }
        ])
        const check = await User.findOne({ useremail: req.session.user, 'cart.productid': req.params.id });
        let productprice;
        if (data[0].categoryOffer[0] && data[0].productOffer[0] && data[0].productOffer[0].enable && data[0].categoryOffer[0].enable) {
            const productDiscount = data[0].price * data[0].productOffer[0].discount / 100;
            const categoryDiscount = data[0].price * data[0].categoryOffer[0].discount / 100;
            productprice = Math.floor(data[0].price - Math.max(productDiscount, categoryDiscount));
        } else if (data[0].productOffer[0] && data[0].productOffer[0].enable) {
            productprice = Math.floor(data[0].price - (data[0].price * data[0].productOffer[0].discount / 100));
        } else if (data[0].categoryOffer[0] && data[0].categoryOffer[0].enable) {
            productprice = Math.floor(data[0].price - (data[0].price * data[0].categoryOffer[0].discount / 100));
        } else {
            productprice = data[0].price;
        }
        if (check) {
            await User.updateOne(
                { useremail: req.session.user, 'cart.productid': req.params.id },
                { $inc: { 'cart.$.productquantity': 1 } }
            );
        } else {
            const cartdata = {
                productid: data[0].productid,
                productname: data[0].name,
                productprice: Number(productprice),
                productcategory: data[0].categoryname,
                productimage: data[0].image[0]
            };
            await User.findByIdAndUpdate(
                user,
                { $push: { cart: cartdata } },
                { new: true }
            );
        }
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};




const user_cart = async (req, res) => {
    try {
        const user = await User.findOne({ useremail: req.session.user })
        const cart = user.cart
        res.render('userviews/cart', { user, cart })
    } catch (error) {
        console.log(error);
    }
}

const increasequantity = async (req, res) => {
    const id = req.query.id
    const value = req.query.value
    const product = await Product.findOne({ productid: req.query.id }, { stock: 1, _id: 0 })
    if (value < product.stock) {
        await User.updateOne({ useremail: req.session.user, 'cart.productid': req.query.id },
            { $inc: { 'cart.$.productquantity': 1 } })

        const user = await User.findOne({ useremail: req.session.user })
        const cart = user.cart
        res.json({ success: true, msg: 'upadated successfully', cart })
    } else {
        res.json({ success: false, msg: 'stock limit exceeded' })
    }
}

const decreasequantity = async (req, res) => {
    const value = req.query.value
    if (value > 1) {
        await User.updateOne({ useremail: req.session.user, 'cart.productid': req.query.id },
            { $inc: { 'cart.$.productquantity': -1 } })

        const user = await User.findOne({ useremail: req.session.user })
        const cart = user.cart

        res.json({ success: true, msg: 'upadated successfully', cart})
    } else {
        res.json({ success: false, msg: 'invalid count' })
    }
}


const deletecart = async (req, res) => {
    try {
        await User.updateOne({ useremail: req.session.user, 'cart.productid': req.query.id },
            { $pull: { cart: { productid: req.query.id } } })
        res.redirect('/cart')
    } catch (error) {
        console.log(error)
    }
}

const wishlist = async (req, res) => {
    try {
        const user = await User.findOne({ useremail: req.session.user })
        const wishlist = user.wishlist
        res.render('userviews/wishlist', { user, wishlist })
    } catch (error) {
        console.log(error);
    }
}

const addwishlist = async (req, res) => {
    try {
        const user = await User.findOne({ useremail: req.session.user })
        const data = await Product.find({ productid: req.params.id })
        const check = await User.findOne({ useremail: req.session.user, 'wishlist.productid': req.params.id })
        if (check) {
            res.json({ success: false, message: "Product already added to the wishlist" })
        } else {
            const wishlistdata = {
                productid: data[0].productid,
                productname: data[0].name,
                productprice: data[0].offerenable ? data[0].discountedPrice : data[0].price,
                productcategory: data[0].categoryname,
                productimage: data[0].image[0],
            }
            await User.findByIdAndUpdate(user, { $push: { wishlist: wishlistdata } }, { new: true })

            res.json({ success: true, message: "Product successfully added to wishlist" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });

    }
}
const deletewishlist = async (req, res) => {
    try {
        await User.updateOne({ useremail: req.session.user, 'wishlist.productid': req.query.id }, { $pull: { wishlist: { productid: req.query.id } } })
        res.redirect('/wishlist')

    } catch (error) {
        console.log(error);

    }
}











module.exports = {
    user_addcart,
    user_cart,
    increasequantity,
    decreasequantity,
    deletecart,
    wishlist,
    addwishlist,
    deletewishlist

}