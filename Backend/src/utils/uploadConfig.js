// // const multer = require('multer');
// // const path = require('path');

// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, 'uploads/')
// //   },
// //   filename: function (req, file, cb) {
// //     cb(null, Date.now() + '-' + file.originalname)
// //   }
// // });

// // const fileFilter = (req, file, cb) => {
// //   const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
// //   if (allowedTypes.includes(file.mimetype)) {
// //     cb(null, true);
// //   } else {
// //     cb(new Error('Invalid file type. Only PDF, JPEG and PNG are allowed!'), false);
// //   }
// // };

// // const upload = multer({ 
// //   storage: storage,
// //   fileFilter: fileFilter,
// //   limits: {
// //     fileSize: 5 * 1024 * 1024 // 5MB limit
// //   }
// // });

// // module.exports = upload;


// const multer = require("multer");
// const path = require("path");
// const { ApiError } = require("../errors/errorHandler");

// // Storage engine with folders for images, pdfs, and audios
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, "uploads/images"); // For book covers
//     } else if (file.mimetype === "application/pdf") {
//       cb(null, "uploads/pdfs"); // For ebook PDFs
//     } else if (file.mimetype.startsWith("audio/")) {
//       cb(null, "uploads/audios"); // For audio files
//     } else {
//       cb(new ApiError("Invalid file type", 400), false);
//     }
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// // Allowed mimetypes including audio
// const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
// const allowedAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg"];
// const allowedPdfTypes = ["application/pdf"];

// const fileFilter = (req, file, cb) => {
//   if (
//     allowedImageTypes.includes(file.mimetype) ||
//     allowedPdfTypes.includes(file.mimetype) ||
//     allowedAudioTypes.includes(file.mimetype)
//   ) {
//     cb(null, true);
//   } else {
//     cb(new ApiError("Only image (jpg, png, webp), PDF, and audio files are allowed", 400), false);
//   }
// };

// // File size limit, you can customize or use different limits per file type if needed
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max (adjust as you want)
// });

// module.exports = upload;


const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const s3 = require("../config/s3"); // 👈 your AWS S3 client
const { ApiError } = require("../errors/errorHandler");

// Allowed file types
const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif", "image/svg+xml", "image/bmp", "image/tiff"];
const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"];
const allowedPdfTypes = ["application/pdf"];

// File filter
const fileFilter = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype) || allowedPdfTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError("Only images (jpg, png, webp, gif, svg, bmp, tiff), videos (mp4, mov, mkv, webm) and PDFs are allowed", 400), false);
  }
};

// Multer-S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME, // 👈 must exist in .env
    acl: "private", // 👈 use "private" for signed URLs, "public-read" for direct access
    contentType: (req, file, cb) => {
      // Let S3 detect content type automatically
      cb(null, file.mimetype);
    },
    contentDisposition: (req, file, cb) => {
      if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
        // Force browser to open PDFs inline
        cb(null, "inline");
      } else {
        cb(null, "attachment"); // others can download
      }
    },
    key: (req, file, cb) => {
      let folder = "others";
      if (file.mimetype.startsWith("image/")) {
        folder = "images";
      } else if (file.mimetype.startsWith("video/")) {
        folder = "videos";
      } else if (file.mimetype === "application/pdf") {
        folder = "pdfs";
      }
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${folder}/${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter,
  limits: { fileSize: 700 * 1024 * 1024 }, // 100 MB
});

module.exports = upload;
