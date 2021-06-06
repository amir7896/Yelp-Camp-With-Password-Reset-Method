const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// User Schema....!!!
const UserSchema = new mongoose.Schema({
	username:{type:String , unique:true, required:true},
	email :{type:String , unique:true, required:true},
	resetPasswordToken :String,
	resetPasswordExpires : Date,
	password:String
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);