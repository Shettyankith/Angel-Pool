const mongoose=require("mongoose");
const User=require("./user");

const jobSchema=new mongoose.Schema({
    title:{
        type:String,
    },
    company:{
        type:String,
    },
    logo:{
        url:String,
        filename:String,
    },
    location:{
        type:String,
    },
    description:{
        type:String,
    },
    salaryRange:{
        type:String,
    },
    datePosted:{
        type:Date,
        default: Date.now,
    },
    category:{
        type:String,
    },
    experience:{
        type:String,
    },
    remote:{
        type:String,
    },
    postedby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
});

const Job=mongoose.model("Job",jobSchema);
module.exports=Job;