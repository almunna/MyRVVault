const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");
const { bucket } = require("../config/db");
const { ApiError } = require("../errors/errorHandler");

const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif", "image/svg+xml", "image/bmp", "image/tiff"];
const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"];
const allowedPdfTypes = ["application/pdf"];

const fileFilter = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype) || allowedPdfTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log("Rejected file mimetype:", file.mimetype, "| originalname:", file.originalname);
    cb(new ApiError(`File type not allowed: ${file.mimetype}`, 400), false);
  }
};

class FirebaseStorageEngine {
  _handleFile(req, file, cb) {
    let folder = "others";
    if (file.mimetype.startsWith("image/")) folder = "images";
    else if (file.mimetype.startsWith("video/")) folder = "videos";
    else if (file.mimetype === "application/pdf") folder = "pdfs";

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${folder}/${uniqueSuffix}${path.extname(file.originalname)}`;
    const token = randomUUID();
    const fileRef = bucket.file(filename);

    const writeStream = fileRef.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: { firebaseStorageDownloadTokens: token },
      },
      resumable: false,
    });

    file.stream.pipe(writeStream)
      .on("error", cb)
      .on("finish", () => {
        const encodedPath = encodeURIComponent(filename);
        const location = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
        cb(null, { filename, location });
      });
  }

  _removeFile(req, file, cb) {
    bucket.file(file.filename).delete().catch(() => {}).then(() => cb(null));
  }
}

const upload = multer({
  storage: new FirebaseStorageEngine(),
  fileFilter,
  limits: { fileSize: 700 * 1024 * 1024 },
});

module.exports = upload;
