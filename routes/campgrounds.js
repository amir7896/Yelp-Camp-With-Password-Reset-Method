const express      = require("express");
const router       = express.Router();
const Campground   = require("../models/campground");
const middleware   =require("../middleware/");
require('dotenv').config();
const multer = require('multer');
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
    params:{
    	 folder: 'YelpCamp'
    }
  }
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})

const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.cloudinary_name, 
  api_key: process.env.cloud_key, 
  api_secret: process.env.cloud_secret
});

// =====================
// Campgrounds Routes
// ====================

// ===========================
// Index Show All CampGrounds
// ===========================
router.get("/" , function(req,res){
	// Get All CampGrouds From Database
	Campground.find({}, function(err , allCampgrounds){
		if (err) {
			console.log(err);
		}else{
			res.render("campgrounds/index", {campgrounds:allCampgrounds});
		}
	});
});

// ===================================
// ADDING NEW CAMPGROUND TO DataBase
// ===================================

router.post("/",middleware.isLoggedIn, upload.single('image'),function(req,res){
cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the campground object under image property
  req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
  req.body.campground.imageId = result.public_id;
  const price =req.body.price;
  // add author to campground
  req.body.campground.author = {
    id: req.user._id,
    username: req.user.username
  }
  Campground.create(req.body.campground, function(err, campground) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    req.flash("success","Campground Added Successfully!");
    res.redirect('/campgrounds/' + campground.id);
  });
});
});

// ===========================
// Add Campground Form in DB
// ============================
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

// ===================================================
// Show-----shows more info about one Campground
// ===================================================

router.get("/:id",function(req, res) {
	// Show Campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}else{
			console.log(foundCampground);
			// Render Show Template With That Campgrounds
	         res.render("campgrounds/show" , {campground: foundCampground});

		}
	});
});
//================
// Edit Route
//================
router.get("/:id/edit" ,middleware.checkCampgroundOwnerShip, function(req, res){
	Campground.findById(req.params.id, function(err , foundCampground){
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.render("campgrounds/edit" , {campground :foundCampground});
		}
	});
	
});
//=================
// Update Route
//=================
router.put("/:id", upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.price       =req.body.price;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});
//===============
//  Delte Route
//===============
router.delete('/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});


module.exports = router;