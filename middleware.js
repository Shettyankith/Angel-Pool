const user=require("./models/user");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirecturl = req.originalUrl;
        return res.redirect("/login"); 
    }
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
 if(req.session.redirecturl){
    res.locals.redirectUrl=req.session.redirecturl;
    console.log(res.locals.redirectUrl);
 }
 next();
};

