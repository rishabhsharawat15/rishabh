require("dotenv").config(); //this should be on top for .env file access
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });


//bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 8; //this can be any higher the number higher time will take to check inlog in 
//but al the sam etime more secure



const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "please check"]
    },
    password: {
        type: String,
        required: [true, "please check"]
    }
});

const Userlist = new mongoose.model("Userlist", userSchema);
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", function(req, res) {
    res.render("home");
});


app.get("/register", function(req, res) {
    res.render("register");
});
app.post("/register", function(req, res) {
    const usern = req.body.username;

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) //requiring password 
        {
            const nwUsr = new Userlist({
                email: usern,
                password: hash
            });
            nwUsr.save(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.render("secrets");
                }
            });
        });

});

app.get("/login", function(req, res) {
    res.render("login");
});


app.post("/login", function(req, res) {
    const curUsr = req.body.username;
    const curpas = req.body.password; //hshing added in the both end registering and login 

    Userlist.findOne({ email: curUsr }, function(err, found) {
        if (err) {
            console.log(err);
        } else {
            bcrypt.compare(curpas, found.password, function(err, result) {
                if (result === true) {
                    res.render("secrets");
                } else {
                    res.write("wrong details");
                }
            });
        }
    });
});

app.get("/submit", function(req, res) {
    res.render("submit");
});










app.listen(3000, function() {
    console.log("server is running on port 3000");
});