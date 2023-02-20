const User = require("../models/user");

const { body, validationResult } = require("express-validator");
//const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { use } = require("../routes");

async function hashPassword(password) {
 return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
 return await bcrypt.compare(plainPassword, hashedPassword);
}


exports.login_get = (req, res) => {
  res.render("user/login");
};

exports.login_post = async (req, res, next) => {
	try {
	 const { username, password } = req.body;
	 const user = await User.findOne({ name: username });
	 if (!user) return next(new Error('Username does not exist'));
	 const validPassword = await validatePassword(password, user.password);
	 if (!validPassword) return next(new Error('Password is not correct'))
	 /* const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
	  expiresIn: "1d"
	 }); */
	 //await User.findByIdAndUpdate(user._id, { accessToken })
	 req.session.userid = user._id; //Sets current user id in session
	 
	 res.redirect("/");
	} catch (error) {
	 next(error);
	}
   }




exports.register_get = (req, res) => {
	res.render("user/register");
  };

exports.register_post = async (req, res, next) => {
	try {
	 const { username, password, role } = req.body
	 let hashedPassword = await hashPassword(password) ;
	 const newUser = new User({ name:username, password: hashedPassword, role: role || "basic", });
	 /* const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
	  expiresIn: "1d"
	 });
	 newUser.accessToken = accessToken; */

	 User.findOne({ name: username}).exec(function(err, foundUser){
		if (err){ return next(err);}

		if (foundUser){
			return res.json({
				error: "That user already exists. Please choose another name",
			});
		}

		newUser.save((err)=>{
			if (err){ return next(err);}
	
			req.session.userid = newUser._id; //Sets current user id in session
	
			res.redirect("/");
		 });
	 })

	 
	} catch (error) {
	 next(error)
	}
   }




exports.logout = (req,res,next) =>{
	if (req.session){
		req.session.userid = null;
	}

	//Logged or not logged, they will be redirected to /
	res.redirect("/");
}


exports.allowIfLoggedin = async (req, res, next) => {
	try {
	 const user = req.session;
	 if (!user.userid)
	  return res.status(401).json({
	   error: "You need to be logged in to access this route"
	  });
	  req.user = user;
	  next();
	 } catch (error) {
	  next(error);
	 }
}

exports.allowIfAdmin = async (req, res, next) => {
	const user = req.session;
	let userId = user.userid;

	if (!userId){ return res.status(401).json({
		error: "You need to be logged in to access this route"
	   });
	}

	User.findById(userId).exec(function(err, foundUser){
		if (err){ return next(err);}

		if (foundUser && "admin" != foundUser.role[0]){
			return res.status(401).json({
				error: "You need to be an admin to access this route"
			   });			
		}

		next();
	})
}