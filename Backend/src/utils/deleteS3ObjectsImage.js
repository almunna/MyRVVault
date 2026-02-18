const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require('../config/s3');

const deleteS3Objects = async (keys) => {
    if (!keys?.length) return;

    const deletePromises = keys
        .filter(Boolean)
        .map(key => {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: typeof key === 'string' ? key.split('/').pop() : key
            };
            return s3Client.send(new DeleteObjectCommand(params))
                .catch(err => console.error('Error deleting S3 object:', err));
        });

    await Promise.all(deletePromises);
}

module.exports = deleteS3Objects;