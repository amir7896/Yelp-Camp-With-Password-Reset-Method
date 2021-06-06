// All The Middleware Goes here
const Campground    = require("../models/campground");
const Comment    = require("../models/comment");


const MiddlewareObj = {};

//=============================================================
// MIDDELWEAR FUNCTION FOR CHECKING USER Campground OwnerShip
//=============================================================
MiddlewareObj.checkCampgroundOwnerShip = function(req,res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id , function(err, foundCampground){
			if(err){
				req.flash("error", "Campground Not Found!");
				res.redirect("back");
			}else{
				if(foundCampground.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You Have Not Permission!");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "You Must Be Login First!");
		res.redirect("back");
	}
}

//==========================================================
// MIDDELWEAR FUNCTION FOR CHECKING USER COMMENT OWNERSHIP
//==========================================================
MiddlewareObj.checkCommentOwnerShip  = function (req,res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id , function(err, foundComment){
			if(err){
				req.flash("error", "Some Thing Went Wrong!");
				res.redirect("back");
			}else{
				if(foundComment.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You Don't Have Permission To Do That!");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "You Must Be Login First!");
		res.redirect("back");
	}
}

//============================================
// MIDDELWEAR FUNCTION FOR CHECKING USER LOGIN
//============================================
MiddlewareObj.isLoggedIn = function(req,res , next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You Must Be Login First!!");
	res.redirect("/login");
}

module.exports = MiddlewareObj;