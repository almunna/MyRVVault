const { db } = require('../config/db');
const deleteS3Objects = require('./deleteS3ObjectsImage');

/**
 * Delete a Firestore document and its associated S3 images
 * @param {string} collectionName - Firestore collection name
 * @param {string} id - Document ID
 */
const deleteDocumentWithFiles = async (collectionName, id) => {
  const doc = await db.collection(collectionName).doc(id).get();
  if (!doc.exists) return null;
  const data = { id: doc.id, ...doc.data() };

  if (data.images && data.images.length > 0) {
    await deleteS3Objects(data.images);
  }

  await db.collection(collectionName).doc(id).delete();
  return data;
};

module.exports = deleteDocumentWithFiles;
