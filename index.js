if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const port = 8080;
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const User = require("./models/user");
const Job = require("./models/job");
const ejs = require("ejs");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const methodoverride = require("method-override");
const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");
const { logostorage, picstorage, resumestorage } = require("./cloudConfig.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const {
  isLoggedIn,
  saveRedirectUrl,
  iscvUploaded,
} = require("./middleware.js");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");

const sessionOptions = {
  secret: "secretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.engine("ejs", ejsMate);
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  res.locals.warning = req.flash("warning");
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.send("I AM ROOT");
});

//Home
app.get("/home", (req, res) => {
  res.render("jobs/home.ejs");
});

// Index route
app.get("/jobs", async (req, res) => {
  let jobs = await Job.find();
  res.render("jobs/index.ejs", { jobs });
});

//Show route
app.get("/jobs/show/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const job = await Job.findById(id).populate("postedby");
    if (!job) {
      return res.status(404).send("Job not found");
    }
    let postedby = job.postedby;
    let role = req.user;
    res.render("jobs/show.ejs", { job, role, postedby, currentUser: req.user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Edit Route
app.get("/jobs/edit/:id", isLoggedIn, async (req, res) => {
  let id = req.params.id;
  let job = await Job.findById(id);
  res.render("jobs/edit.ejs", { job });
});

app.post("/jobs/edit/:id", isLoggedIn, async (req, res) => {
  let id = req.params.id;
  let newJob = { ...req.body, new: true };
  await Job.findByIdAndUpdate(id, newJob);
  req.flash("success", `${newJob.title} details edited successfully`);
  res.redirect(`/jobs/show/${id}`);
});

//Delete route
app.delete("/jobs/:id", isLoggedIn, async (req, res) => {
  let id = req.params.id;
  await Job.findByIdAndDelete(id);
  req.flash("success", "Job details deleted!");
  res.redirect("/jobs");
});

// Create route
app.get("/jobs/new", isLoggedIn, (req, res) => {
  res.render("jobs/new.ejs");
});

app.post(
  "/jobs/new",
  isLoggedIn,
  multer({ storage: picstorage }).single("logo"),
  async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let newJobData = req.body;
    newJobData.logo = { url, filename };
    newJobData.postedby = req.user._id;
    let newJob = new Job(newJobData);
    await newJob.save();
    console.log(newJob);
    req.flash("success", `${newJob.title} role created`);
    res.redirect("/jobs");
  }
);

// User routes

// user register
app.get("/register", (req, res) => {
  res.render("users/register.ejs");
});

app.post(
  "/register",
  multer({ storage: picstorage }).single("pic"),
  async (req, res) => {
    try {
      const newUser = new User(req.body);
      const url = req.file.path;
      const filename = req.file.filename;
      newUser.pic = { url, filename };
      console.log(newUser);
      const password = req.body.password;
      await User.register(newUser, password);
      req.flash("success", `Welcome to Angel Pool ${req.user.username}`);
      res.redirect("/jobs");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  }
);

// Login route
app.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

app.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", { failureRedirect: "/login" }),
  async (req, res) => {
    req.flash("success", `Welcome Back ${req.user.username}`);
    let url = res.locals.redirectUrl || "/jobs";
    res.redirect(url);
  }
);

// Logout route
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/jobs");
  });
});

//SavedJobs route
app.post("/jobs/:id/savedJobs", async (req, res) => {
  let id = req.params.id;
  const savedJob = req.user.savedJobs.includes(id);
  if (savedJob) {
    req.flash("warning", "This job is already saved!");
    res.redirect(`/jobs/show/${id}`);
  } else {
    const job = await Job.findById(id);
    if (!job) {
      req.flash("failure", "Job not found!");
      res.redirect(`/jobs/show/${id}`);
    }
    req.user.savedJobs.push(id);
    await req.user.save();
    req.flash("success", "Job is saved successfully");
    res.redirect(`/jobs/show/${id}`);
  }
});

app.delete("/jobs/:id/deleteSavedJob", isLoggedIn, async (req, res) => {
  let jobId = req.params.id;
  const jobIndex = req.user.savedJobs.indexOf(jobId);
  req.user.savedJobs.splice(jobIndex, 1);
  await req.user.save();
  req.flash("success", "Job is removed from saved list");
  res.redirect("/my-account");
});

// Apply Job route
app.post("/jobs/:id/apply", isLoggedIn, iscvUploaded, async (req, res) => {
  const id = req.params.id;
  const appliedJob = req.user.appliedJobs.includes(id);
  if (appliedJob) {
    req.flash("warning", "You have already applied for this role!");
    res.redirect(`/jobs/show/${id}`);
  } else {
    let job = await Job.findById(id);
    if (!job) {
      req.flash("failure", "Job not found!");
      res.redirect(`/jobs/show/${id}`);
    }
    req.user.appliedJobs.push(id);
    await req.user.save();
    req.flash("success", "You profile has been sent to HR");
    res.redirect(`/jobs/show/${id}`);
  }
});

app.delete("/jobs/:id/deleteAppliedJob", isLoggedIn, async (req, res) => {
  let jobId = req.params.id;
  const jobIndex = req.user.appliedJobs.indexOf(jobId);
  req.user.appliedJobs.splice(jobIndex, 1);
  await req.user.save();
  req.flash("success", "Job is removed from saved list");
  res.redirect("/my-account");
});

// My account route
app.get("/my-account", isLoggedIn, async (req, res) => {
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
app.get("/upload-cv", (req, res) => {
  res.render("users/uploadcv.ejs");
});

app.post(
  "/upload-cv",
  multer({ storage: resumestorage }).single("resume"),
  async (req, res) => {
    const url = req.file.path;
    const filename = req.file.filename;
    req.user.resume.url = url;
    req.user.resume.filename = filename;
    await req.user.save();
    console.log("Resume uploaded!");
    res.render("users/myaccount.ejs");
  }
);

// View CV
app.get("/view-cv", isLoggedIn, (req, res) => {
  const url = req.user.resume.url;
  res.json({ url });
});

//Handling random routes
app.get("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

//Server Crash code
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandeled rejection at:", promise, "Reason:", reason);
});
mongoose.connection.on("error", (err) => {
  console.log("Mongodb connection error", err);
});

// Async Error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("jobs/error.ejs", { message });
});

// Mongoose Connection
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/angel");
}

main()
  .then(() => {
    console.log("Connection Established");
  })
  .catch((err) => {
    console.log("Some error in DataBase");
  });

app.listen(port, () => {
  console.log(`App is listening at ${port}`);
});
