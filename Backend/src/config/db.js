const admin = require('firebase-admin');

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')
    );
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err.message);
    process.exit(1);
  }
} else {
  serviceAccount = require('../../my-rv-vault-firebase-adminsdk-fbsvc-d75ced7cc1.json');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;
const bucket = admin.storage().bucket();

console.log('✅ Firebase Firestore connected');
console.log('✅ Firebase Storage bucket:', bucket.name);

module.exports = { db, FieldValue, Timestamp, bucket };
