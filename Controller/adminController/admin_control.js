const multer = require('multer')
const path = require('path')
const Admin = require('../../Model/admin')
const Category = require('../../Model/category')
const Product = require('../../Model/product')
const User = require('../../Model/user')
const Order = require('../../Model/orders')
const Coupon = require('../../Model/coupon')
const { v4: uuidv4 } = require('uuid')
const session = require('express-session')
const fs = require('fs')
const pdfDoc = require('pdfkit')
const ExcelJS = require('exceljs')
const PDFDocument = require('../../storage/pdfTableModel')
const pdfGenerator = require('../../storage/salesPdf')




// adminlogin route
const admin_login = async (req, res) => {
    if (req.session.admin) {
        res.redirect('/admindashboard');
    } else {
        res.render('adminviews/sign-in.ejs')
    }
}

const adminload_login = async (req, res) => {
    try {
        const check = await Admin.findOne({ adminemail: req.body.email })
        if (check) {
            if (check.adminpassword === req.body.password) {
                req.session.admin = check.adminemail
                res.redirect('/admindashboard')
            } else {
                res.render('adminviews/sign-in.ejs', { error: "Incorrect password" })
            }
        } else {
            res.render('adminviews/sign-in.ejs', { error: "Admin not found" })
        }
    } catch (error) {
        res.send("Wrong name")

    }
}
// admin dashboard
const admin_dashboard = async (req, res) => {
    try {
        const getStartOfMonth = () => {
            const today = new Date()
            return new Date(today.getFullYear(), today.getMonth(), 1)

        }

        const category = await Category.find({}).count()
        const orders = await Order.find({}).count()
        const product = await Product.find({}).count()
        const users = await User.find({}).count()

        const delivered = await Order.countDocuments({ 'status': "Delivered" }).count()
        const cancelled = await Order.countDocuments({ 'status': "Cancelled" }).count()
        const placed = await Order.countDocuments({ 'status': "Placed" }).count()
        const returned = await Order.countDocuments({ 'status': "Returned" }).count()


        const catfood = await Order.countDocuments({ 'orderitems.productcategory': "Cat food" }).count()
        const dogfood = await Order.countDocuments({ 'orderitems.productcategory': "Dog food" }).count()
        const birdfood = await Order.countDocuments({ 'orderitems.productcategory': "Bird food" }).count()

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    purchasedate: { $gte: getStartOfMonth() },
                    status:'Delivered'
                }
            }, {
                $group: {
                    _id: { $month: "$purchasedate" }, totalSales: { $sum: "$total" }
                }
            }, { $sort: { _id: 1 } }
        ])
        const yearlySales = await Order.aggregate([
            {
                $match:{
                    status:'Delivered'
                }
            },
                {
                $group: {
                    _id: { $year: "$purchasedate" },
                    totalSales: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const monthlySalesData = monthlySales.map(item => item.totalSales);
        const yearlySalesData = yearlySales.map(item => item.totalSales);

        res.render('adminviews/dashboard', {
            category, orders, product, users, pagepath: 'dashboard', delivered, cancelled, placed,
            returned, catfood, dogfood, birdfood, monthlySalesData, yearlySalesData
        })
    } catch (error) {
        console.log(error)
    }
}

const report_view = async (req, res) => {
    try {
        let query = {status:'Delivered'};
        if (req.query.startDate && req.query.endDate) {
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);
            query.purchasedate = {
                $gte: startDate,
                $lt: endDate
            };
        }
        if (req.query.month) {
            const month = parseInt(req.query.month);
            const year = new Date().getFullYear();
            const firstDayOfMonth = new Date(year, month - 1, 1);
            const lastDayOfMonth = month === 12
                ? new Date(year + 1, 0, 1)
                : new Date(year, month, 1);

            query.purchasedate = {
                $gte: firstDayOfMonth,
                $lt: lastDayOfMonth
            };
        }
        if (req.query.year) {
            const year = parseInt(req.query.year);
            const firstDayOfYear = new Date(year, 0, 1);
            const lastDayOfYear = new Date(year + 1, 0, 1);

            query.purchasedate = {
                $gte: firstDayOfYear,
                $lt: lastDayOfYear
            };
        }
        const orders = await Order.find(query);
        res.render('adminviews/report', { orders })
    } catch (error) {
        console.log(error)
    }
}


// pdf generate

const generatepdf = async (req, res) => {
    try {
        const {startDate,endDate, month, year } = req.query;

        // Construct query with filtering logic
        const query = constructQuery( "Delivered",startDate,endDate, month, year);
        let orders = await Order.find(query);

        const doc = new PDFDocument();

        const pdfDoc = pdfGenerator(doc, orders)

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'inline; filename="sales-details.pdf"');

        pdfDoc.pipe(res);

        // End the PDF document
        pdfDoc.end();

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating the PDF report');
    }
};

function constructQuery(startDate,endDate, month, year) {
    let query = {status:'Delivered'};

    // Apply date filters
    if (startDate && endDate) {
        query.purchasedate = {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
        };
    }
 else if (month) {
        const parsedMonth = parseInt(month) - 1; // Months are 0-indexed
        const currentYear = new Date().getFullYear();
        const firstDayOfMonth = new Date(currentYear, parsedMonth, 1);
        const lastDayOfMonth = parsedMonth === 11
            ? new Date(currentYear + 1, 0, 1)
            : new Date(currentYear, parsedMonth + 1, 1);

        query.purchasedate = {
            $gte: firstDayOfMonth,
            $lt: lastDayOfMonth
        };
    } else if (year) {
        const parsedYear = parseInt(year);
        const firstDayOfYear = new Date(parsedYear, 0, 1);
        const lastDayOfYear = new Date(parsedYear + 1, 0, 1);

        query.purchasedate = {
            $gte: firstDayOfYear,
            $lt: lastDayOfYear
        };
    }

    return query;
}


const excel_view = async (req, res) => {
    try {
        const orders = await Order.find()
        res.render('adminviews/excel', { orders })
    } catch (error) {
        console.log(error)
    }
}

// excel generate

const generateexcel = async (req, res) => {
    try {
        const orders = await Order.find({status:'Delivered'});
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Add headers to the worksheet
        worksheet.columns = [
            { header: 'Order Id', key: 'orderid', width: 15 },
            { header: 'Purchase Email', key: 'email', width: 20 },
            { header: 'Total Amount', key: 'total', width: 15 },
            { header: 'Date of Delivery', key: 'deliverydate', width: 20 },
            { header: 'Payment Method', key: 'paymentmethod', width: 20 },
            { header: 'Order Status', key: 'status', width: 15 },
        ];

        orders.forEach(order => {
            worksheet.addRow({
                orderid: order.orderid,
                email: order.email,
                total: order.total,
                deliverydate: order.deliverydate,
                paymentmethod: order.paymentmethod,
                status: order.status === 'Delivered' ? 'Delivered' : order.status,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=SalesReport.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
    }
}


// admin logout
const admin_logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.send(err);
        } else {
            res.redirect('/adminlogin');
        }
    });
}
const error = async (req, res) => {
    res.render('adminviews/admin404')
}



module.exports = {
    admin_login,
    adminload_login,
    admin_dashboard,
    report_view,
    generatepdf,
    excel_view,
    generateexcel,
    admin_logout,
    error
}




