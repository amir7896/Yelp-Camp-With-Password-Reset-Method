const express      = require("express");
const router       = express.Router();
const passport     =require("passport");
const User         = require("../models/user");
const async        =require("async");
const nodemailer   = require("nodemailer");
const crypto       =require("crypto");
require('dotenv').config();
// ==============
//ROOT ROUTE
//===============

router.get("/",function(req, res){
	res.render("landing");
});

//========================
// AUTHENTICATION ROUTES
//========================

//==============================
// Show Register or SignUp Page
//==============================
router.get("/register" , function(req, res){
	res.render("register");
});
//========================================
// Handeling Registration Form And SignUp
//=========================================
router.post("/register", function(req,res){
	const newUser = new User({username:req.body.username ,email: req.body.email,});
	User.register(newUser , req.body.password , function(err , user){
		if(err){
			req.flash("error", err.message);
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req ,res ,function(){
			req.flash("success", "You Have Registerd Successfully!" +user.username);
			res.redirect("/campgrounds");
		});
	});
});
//=================
// Show Login Page
//==================
router.get("/login", function(req, res){
	res.render("login");
});

//==================
// Handeling Login 
//==================
router.post("/login", passport.authenticate("local" ,
	{
		successRedirect:"/campgrounds",
		failureRedirect:"/login"
	}), function(req, res){
});
//==================
// Handling Logout
//==================
router.get("/logout" ,function(req, res){
	req.logout();
	req.flash("success", "You Are Log Out Successfully!");
	res.redirect("/campgrounds");
});

//=======================
// FORGET PASSWORD ROUTE
//=======================
router.get("/forget", function(req,res){
	res.render("forget");
});

//================================
// Handling Forget Password Route
//================================

router.post("/forget", function(req, res,next){
	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err, buf){
				var token = buf.toString('hex');
				done(err,token);
			});
		},
		function(token, done){
			User.findOne({email:req.body.email}, function(err,user){
				if(!user){
					req.flash("error" ,"No Account With THat Email Exists");
					return res.redirect("/forget");
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires= Date.now() +3600000;// 1 hour

				user.save(function(err){
					done(err,token,user);
				});
			});
		},
		function(token, user,done){
			var smtpTransport  = nodemailer.createTransport({
				service : 'Gmail',
				auth :{
					user:"amirshahzad07896@gmail.com",
					pass:process.env.GMAILPW
				}
			});
			const mailOptions ={
				to: user.email,
				from:"amirshahzad07896@gmail.com",
				subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
			smtpTransport.sendMail(mailOptions , function(err){
				console.log("Mail Sent");
				req.flash("success", "Email Has Been Sent TO Your Email");
				done(err, 'done');
			});
		}
		], function(err){
			if(err) return next(err);
			res.redirect("/forget");
		});
});

//============
//Reset Route
//============

router.get('/reset/:token',function(req,res){
	User.findOne({resetPasswordToken:req.params.token , resetPasswordToken:{$gt :Date.now()}}, function(err,user){
		if(!user){
			req.flash("error", "Password Reseet Token Has Expired");
			return res.redirect("/forget");
		}
		res.render('reset', {token:req.params.token});
	});
});

//==============
//Handling Reset
//==============
router.post('/reset/:token',function(req,res){
	async.waterfall([
		function(done){
			User.findOne({resetPasswordToken :req.params.token ,  resetPasswordToken:{$gt :Date.now()}}, function(err,user){
				if(!user){
					req.flash("error", "Password Reset Token Expired!");
					return res.redi('back');
				}
				if(req.body.password === req.body.confirm){
					user.setPassword(req.body.password , function(err){
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires=undefined;
						user.save(function(err){
							req.logIn(user,function(err){
								done(err, user)
							});
						});
					})
				}else{
					req.flash("error" , "Password Not Match");
					return res.redirect('back');
				}
			});
		},
		function(user, done){
			var smtpTransport = nodemailer.createTransport({
				service:"Gmail",
				auth:{
					user:"amirshahzad07896@gmail.com",
					pass:process.env.GMAILPW
				}
			});
			const mailOptions ={
				to:user.email,
				from:"amirshahzad07896@gmail.com",
				subject:"Your Password Has Been Changed",
				text:"Hello ,\n\n"+
				"This Is Conformation Password for Your Account"+user.email + " has just Update "
			};
			smtpTransport.sendMail(mailOptions, function(err){
				req.flash("success", "Your Pass word has Been Changed");
				done(err);
			});
		}

		], function(err){
			res.redirect("/campgrounds");
		});
});

module.exports   = router;