const  express             = require("express"),
       bodyParser          = require("body-parser"),
       app                 = express(),
       mongoose            = require("mongoose"),
       passport            = require("passport"),
       LocalStrategy       = require("passport-local"),
       Campground          = require("./models/campground"),
       Comment             = require("./models/comment"),
       User                =require("./models/user"),
       seedDB              = require("./seeds"),
       MethodOverRide      =require("method-override"),
       flash               =require("connect-flash");

// Requiring Routes
const commentsRoutes = require("./routes/comments"),
      campgroundsRoutes = require("./routes/campgrounds"),
      indexRoutes       =require("./routes/index")

// const port = process.env.PORT;
// passport.use(User.createStrategy());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(MethodOverRide("_method"));
app.use(flash());

//seedDB();

// Passport Confugration....
app.use(require("express-session")({
	secret: "The Kallo Is Cutest Goat!",
	resave: false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect("mongodb://localhost:27017/YelpCamp" , 
      {useNewUrlParser :true ,
       useUnifiedTopology: true  ,
       useFindAndModify:false,
       useCreateIndex: true
 });

// =================================================
// MIDDELWEAR FOR Hide and Show Login/Logout Links
// =================================================
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
      res.locals.error     = req.flash("error");
      res.locals.success     = req.flash("success");

	next();
});


//===============
// USING ROUTES
//===============
app.use("/campgrounds/:id/comments",commentsRoutes);
app.use("/campgrounds",campgroundsRoutes);
app.use("/",indexRoutes);


//=================
// Server Listen
//=================
app.listen(3000,function(){
	console.log("Server Start On Port 3000");
});
