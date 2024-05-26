const express=require("express");
const router=express.Router();
const User = require("../models/user");

const multer = require("multer");
const {  picstorage, resumestorage } = require("../cloudConfig.js");
const passport = require("passport");
const {
    isLoggedIn,
    saveRedirectUrl,
} = require("../middleware.js");

const userController=require("../controllers/user.js")

// user register
router.get("/register",userController.registerForm);
  
router.post(
    "/register",
    multer({ storage: picstorage }).single("pic"),
    userController.register
  );
  
  // Login route
  router.get("/login", userController.loginForm);
  
  router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/user/login" }),
    userController.login
  );
  
  // Logout route
  router.get("/logout", userController.logout);
  
  // My account route
  router.get("/my-account", isLoggedIn, userController.myAccount);
  
  
  
  //Resume upload route
  router.get("/upload-cv", isLoggedIn,userController.uploadCVForm);
  
  router.post(
    "/upload-cv",
    multer({ storage: resumestorage }).single("resume"),
    userController.uploadCV
  );
  
  module.exports=router;
  