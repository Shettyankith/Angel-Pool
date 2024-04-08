const mongoose=require("mongoose");
const initData=require("./data");
const Job=require("../models/job");


// Mongoose Connection
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/angel");
}


    main().then(() => {
        console.log("Connection Established");
    }).catch((err) => {
        console.log("Some error in DataBase");
    });    

const initDB=async()=>{
    try{
        await Job.deleteMany({});
    await Job.insertMany(initData);
    console.log("DB is cleaned and inserted");
    }
    catch(e){
        console.error(e);
    }
}

initDB();

async function disconnectFromDatabase() {
    await mongoose.disconnect();
}