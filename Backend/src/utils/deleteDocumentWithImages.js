const fs = require("fs");
const path = require("path");

/**
 * Delete a document and its associated files
 * @param {mongoose.Model} Model - The Mongoose model (e.g., WaterPump, Tire, Book)
 * @param {String} id - The document ID
 * @param {String} baseUploadPath - Base folder for uploads (e.g., "uploads")
 */
const deleteDocumentWithFiles = async (Model, id, baseUploadPath) => {
  const doc = await Model.findById(id);
  if (!doc) return null;

  if (doc.images && doc.images.length > 0) {
    for (const filePath of doc.images) {
      // If DB stores "images/xyz.png", build full path under baseUploadPath
      const fullPath = path.resolve(baseUploadPath, filePath);

      console.log(`🔎 Trying to delete: ${fullPath}`);

      try {
        fs.unlinkSync(fullPath);
        console.log(`✅ Deleted: ${fullPath}`);
      } catch (err) {
        if (err.code === "ENOENT") {
          console.warn(`⚠️ File not found: ${fullPath}`);
        } else {
          console.error(`❌ Error deleting ${fullPath}:`, err);
        }
      }
    }
  }

  await doc.deleteOne();
  return doc;
};

module.exports = deleteDocumentWithFiles;
