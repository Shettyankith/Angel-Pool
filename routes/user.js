const express=require("express");
const router=express.Router();
const User = require("../models/user");
const Job = require("../models/job");
const multer = require("multer");
const {  picstorage, resumestorage } = require("../cloudConfig.js");
const passport = require("passport");
const {
    isLoggedIn,
    saveRedirectUrl,
} = require("../middleware.js");


// user register
router.get("/register", (req, res) => {
    res.render("users/register.ejs");
});
  
router.post(
    "/register",
    multer({ storage: picstorage }).single("pic"),
    async (req, res) => {
        try{
          const newUser = new User(req.body);
        const url = req.file.path;
        const filename = req.file.filename;
        newUser.pic = { url, filename };
        const password = req.body.password;
        await User.register(newUser, password);
        console.log(newUser);
        req.flash("success", `Welcome to Angel Pool ${newUser.username}` );
        res.redirect("/jobs");
        }catch (error) {
          console.error("Error during registration:", error);
          req.flash("error", error.message); 
          res.redirect("/user/register"); 
        }
    }
  );
  
  // Login route
  router.get("/login", (req, res) => {
    res.render("users/login.ejs");
  });
  
  router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/user/login" }),
    async (req, res) => {
      req.flash("success", `Welcome Back ${req.user.username}`);
      let url = res.locals.redirectUrl || "/jobs";
      res.redirect(url);
    }
  );
  
  // Logout route
  router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "You are logged out!");
      res.redirect("/jobs");
    });
  });
  
  // My account route
  router.get("/my-account", isLoggedIn, async (req, res) => {
    let id = req.user.id;
    let user = await User.findById(id);
    let { resume, role, savedJobs, appliedJobs } = req.user;
    let jobsData, appledJobData;
    if (savedJobs || appliedJobs) {
      jobsData = await fetchSavedJobData(savedJobs);
      appledJobData = await fetchSavedJobData(appliedJobs);
    }
    res.render("users/myaccount.ejs", {
      user,
      resume,
      role,
      jobsData,
      appledJobData,
    });
  });
  
  async function fetchSavedJobData(savedJobIds) {
    const savedJobData = [];
    for (let id of savedJobIds) {
      const job = await Job.findById(id).exec();
      if (job) {
        savedJobData.push(job);
      } else {
        console.log(`Cannot fetch data of job with id ${id}`);
      }
    }
    return savedJobData;
  }
  
  //Resume upload route
  router.get("/upload-cv", isLoggedIn,(req, res) => {
    res.render("users/uploadcv.ejs");
  });
  
  router.post(
    "/upload-cv",
    multer({ storage: resumestorage }).single("resume"),
    async (req, res) => {
      const url = req.file.path;
      const filename = req.file.filename;
      req.user.resume.url = url;
      req.user.resume.filename = filename;
      await req.user.save();
      req.flash("success", "Resume Uploaded successfully");
      res.redirect("/user/my-account");
    }
  );
  
  module.exports=router;
  