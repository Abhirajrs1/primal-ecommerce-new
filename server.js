const express = require("express");
const app = express();
const path = require('path');
const user = require('./routes/user');
const admin = require('./routes/admin');
const session = require('express-session');
const nocache = require("nocache");
const { v4: uuidv4 } = require('uuid')
require('dotenv').config();
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);


app.use('/productImages', express.static(path.resolve(__dirname, 'productImages')));
app.use(nocache())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

var store = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
    }, err => {
        if (err) {
            console.log("🍃 An error occured when trying to connect MongoDB to express-session");
            console.error(err);
            process.exit(1);
        } else {
            console.log("🍃 MongoDB connected to express-session");
        }
    }
)


// Set up express to use the session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // store: store,
}));

// Serve static files using express.static
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/adminassets', express.static(path.join(__dirname, 'public/adminassets')))
app.use('/admin-assets', express.static(path.join(__dirname, 'public/admin-assets')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))
app.use('/proassets', express.static(path.join(__dirname, 'public/proassets')))


app.set('view engine', 'ejs')


// Define routes
app.use('/', user);
app.use('/', admin);


app.use((err, req, res, next) => {
    console.log('this is error handling middle ware')
    console.log(err)
})

const port = process.env.PORT || 3500;

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running in http://localhost:${port}`);
        });
    })
    .catch((e) => {
        console.log("Error connecting to MongoDB:", e.message);
    });
