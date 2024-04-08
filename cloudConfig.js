const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
});

const logostorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "angel_dev",
      allowedFormats: ["png","jpeg","jpg"],
    },
  });

  const picstorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "angel_dev/pics",
      allowedFormats: ["png","jpeg","jpg"],
    },
  });

  const resumestorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "angel_dev/resume",
      allowedFormats: ["docx", "pdf", "txt"],
    },
  });

  module.exports={
    cloudinary,logostorage,picstorage,resumestorage
  };