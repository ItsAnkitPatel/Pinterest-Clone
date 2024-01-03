var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");
const pfpupload = require('./multerProfileImage');
const postupload = require('./multerPostsUpload');
const fs = require('fs');
const path = require("path");

passport.use(new localStrategy(userModel.authenticate()));
let nav= false;
router.get("/", function (req, res, next) {
  res.render("index",{nav});
});

router.get("/register", (req, res) => {
  res.render("register",{nav});
});
router.get("/profile", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({username:req.session.passport.user}).populate("posts")
  
  res.render("profile",{user,nav:true});
});
router.get("/showposts", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({username:req.session.passport.user}).populate("posts")
  

  res.render("show",{user,nav:true});
});
router.get("/feed", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({username:req.session.passport.user});
  const posts = await postModel.find().populate("user")

  res.render("feed",{user,posts,nav:true});
});


router.get("/addpost", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({username:req.session.passport.user})
  res.render("add",{user,nav:true});
});
router.post("/createpost", isLoggedIn,postupload.single("postimage"), async (req, res) => {
  const user = await userModel.findOne({username:req.session.passport.user})
  const post = await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("/profile")
});

router.post("/fileupload", isLoggedIn, pfpupload.single("image"), async (req, res) => {
  const user = await userModel.findOne({username:req.session.passport.user})

  //Deleting the previous profile picture
  const prevPfp = await user?.profileImage;
  
  if (prevPfp) {
    const imagePath = path.join(__dirname,"../public/images/profileImages/",prevPfp)
    fs.unlinkSync(imagePath);
  } else {
    console.log('Image file does not exist');
  }
  
  //Updating new profile
  user.profileImage = req.file.filename;

  await user.save()
  res.redirect("./profile")
});



router.post("/register",async (req, res) => {
  const data = new userModel({
    fullname: req.body.fullname,
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
  });
   userModel.register(data, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
  }),
  (req, res) => {}
);
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/");
}
module.exports = router;
