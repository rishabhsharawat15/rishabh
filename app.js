require("dotenv").config(); //this should be on top for .env file access
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//requiring security sessions
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//initailizing the session so that we can use it in passport serialize and deserialize
app.use(session({
    secret: "our secret",
    resave: false,
    saveUninitialized: false
}));
//initializing passport with the session
app.use(passport.initialize()); //initializing passport to use its properties
app.use(passport.session()); //so that passport can access session
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
const userSchema = mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    }
});

//plugin in the passport midule in Schema
userSchema.plugin(passportLocalMongoose); //plugin :to add new powers see mongoose
const User = new mongoose.model("User", userSchema);
//creating stragety
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("home");
});


app.get("/register", function(req, res) {
    res.render("register");
});
app.post("/register", function(req, res) {
    //register is passport funstion just like login delete
    User.register({ username: req.body.username }, req.body.password, function(err, user) { //username and password are comp
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() { //local authentication means tillsession end or tillcrome is running
                res.redirect("/secrets");
            });
        }
    });
});
app.get("/login", function(req, res) {
    res.render("login");
});
app.get("/secrets", function(req, res) {

    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});



app.post("/login", function(req, res) {
    const nwuser = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(nwuser, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    });
});

app.get("/logout", function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});



app.listen(3000, function() {
    console.log("server is running on port 3000");
});



//validation failed it should have only username and password