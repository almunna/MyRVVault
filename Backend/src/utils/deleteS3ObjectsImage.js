const { bucket } = require("../config/db");

const deleteS3Objects = async (urls) => {
  if (!urls?.length) return;

  const deletePromises = urls
    .filter(Boolean)
    .map((url) => {
      // Firebase Storage URL: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token=...
      const match = url.match(/\/o\/([^?]+)/);
      if (!match) return Promise.resolve();
      const filePath = decodeURIComponent(match[1]);
      return bucket.file(filePath).delete().catch((err) => console.error("Error deleting file:", err));
    });

  await Promise.all(deletePromises);
};

module.exports = deleteS3Objects;
