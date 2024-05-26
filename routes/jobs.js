const express=require("express");
const router=express.Router();

const Job = require("../models/job.js");

const multer = require("multer");
const {  picstorage } = require("../cloudConfig.js");

function isCvUploaded(req,res,next){
    if(!req.user.resume){
      console.log(req.user);
    }
    next();
  }

const {
    isLoggedIn,
  } = require("../middleware.js");

const jobsController=require("../controllers/jobs.js");

  // Index route
  router.get("/", jobsController.index);
  
  //Show route
  router.get("/show/:id", jobsController.show);
  
  //Edit Route
  router.get("/edit/:id", isLoggedIn, jobsController.editForm);
  
  router.post("/edit/:id", isLoggedIn, jobsController.edit);
  
  //Delete route
  router.delete("/:id", isLoggedIn, jobsController.deleteJob);
  
  
  // Create route
  router.get("/new", isLoggedIn, jobsController.createForm);
  
  
  router.post(
    "/new",
    isLoggedIn,
    multer({ storage: picstorage }).single("logo"),
    jobsController.create
  );

  
//SavedJobs route
router.post("/:id/savedJobs", jobsController.savedJobs);
  
  router.delete("/:id/deleteSavedJob", isLoggedIn, jobsController.deleteSavedJob);

  
  router.post("/:id/apply", isLoggedIn, isCvUploaded,jobsController.apply);
  
  router.delete("/:id/deleteAppliedJob", isLoggedIn, jobsController.deleteAppliedJob);
  module.exports=router;