const User = require("../models/user");
const Job = require("../models/job");

module.exports.registerForm= (req, res) => {
    res.render("users/register.ejs");
}

module.exports.register=async (req, res) => {
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

module.exports.loginForm=(req, res) => {
    res.render("users/login.ejs");
  }

  module.exports.login=async (req, res) => {
    req.flash("success", `Welcome Back ${req.user.username}`);
    let url = res.locals.redirectUrl || "/jobs";
    res.redirect(url);
  }

  module.exports.logout=(req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "You are logged out!");
      res.redirect("/jobs");
    });
  }

  module.exports.myAccount=async (req, res) => {
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
  }

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

  module.exports.uploadCVForm=(req, res) => {
    res.render("users/uploadcv.ejs");
  }

  module.exports.uploadCV=async (req, res) => {
    const url = req.file.path;
    const filename = req.file.filename;
    req.user.resume.url = url;
    req.user.resume.filename = filename;
    await req.user.save();
    req.flash("success", "Resume Uploaded successfully");
    res.redirect("/user/my-account");
  }




