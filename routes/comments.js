const express = require("express");
const router   = express.Router({mergeParams:true});
const Campground = require("../models/campground");
const Comment    =require("../models/comment");
const middleware   =require("../middleware/");
//===================
// COOMENTS ROUTES
//===================

router.get("/new" , middleware.isLoggedIn , function(req ,res){
	// Find Campground By Id
	Campground.findById(req.params.id , function(err , campground){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new" , {campground : campground});
		}
	})
});

router.post("/" , middleware.isLoggedIn , function(req , res){
	// Lookup CampGround Using ID
	Campground.findById(req.params.id , function(err, campground){
		if(err){
			req.flash("error", "Something Went Wrong!");
			res.redirect("/campgrounds");
		}else{
			Comment.create(req.body.comment , function(err, comment){
				if(err){
					console.log(err);
				}else{
					// Add Username and id to comment in user
					comment.author.id  =req.user._id;
					comment.author.username = req.user.username;
					//console.log("New Comment Will Be"+ req.user.username);
					// save comment
					comment.save();
					// connect new comment to campground
					campground.comments.push(comment);
					campground.save();
					// redirect
					//console.log(comment);
					req.flash("success", "Comment Is Added Successfully!");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});	
});

//=====================
// EDIT COMMENT ROUTE
//=====================
router.get("/:comment_id/edit",middleware.checkCommentOwnerShip, function(req ,res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		}else{
		  res.render("comments/edit",{campground_id : req.params.id , comment:foundComment});
		}
	});
});

//=====================
//UPDATE COMMENT ROUTE
// ====================

router.put("/:comment_id",middleware.checkCommentOwnerShip, function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id , req.body.comment , function(err, UpdateComment){
		if(err){
			res.redirect("back");
		} else{
			req.flash("success", "Comment Updeate Successfully!");
			res.redirect("/campgrounds/" +req.params.id);
		}
	});
});
//=====================
//DELETE COMMENT ROUTE
// ====================
router.delete("/:comment_id",middleware.checkCommentOwnerShip, function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id , function(err){
		if(err){
			res.redirect("back");
		} else{
			req.flash("success", "Comment Deleted Successfully!");
			res.redirect("/campgrounds/" +req.params.id);
		}
	});
});





module.exports  = router;