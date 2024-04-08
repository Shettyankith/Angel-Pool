const mongoose = require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const Job=require("./job");

const userSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
  },
  number: {
    type: Number,
  },
  pic: {
    url: String,
    filename: String,
  },
  role:{
    type:String,
  },
  location: {
    type: String,
  },
  about: {
    type: String,
  },
  experience: {
    type: Number,
    default: 0,
  },
  resume:{
    url: String,
    filename: String,
  },
  savedJobs:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Job",
    },
  ],
  appliedJobs:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Job",
    },
  ],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
