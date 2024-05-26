if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const port = 8080;
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const User = require("./models/user");

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
const MongoStore=require("connect-mongo");
const {
  isLoggedIn,
  saveRedirectUrl,
} = require("./middleware.js");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const jobs=require("./routes/jobs.js");
const user=require("./routes/user.js");


const dbUrl=process.env.ATLAS_URL;



const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("ERROR in Mndo Store",err)
})

const sessionOptions = {
  store:store,
  secret: process.env.SECRET,
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

app.use("/jobs",jobs);
app.use("/user",user);


app.get("/", (req, res) => {
  res.send("I AM ROOT");
});




// Apply Job route
function isCvUploaded(req,res,next){
  if(!req.user.resume){
    console.log(req.user);
  }
  next();
}

app.get("/home", (req, res) => {
  res.render("jobs/home.ejs");
});



app.get("/terms",(req,res)=>{
  res.render("includes/terms&Condition.ejs");
})


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
  await mongoose.connect(dbUrl);
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
