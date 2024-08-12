import AWS from 'aws-sdk';

// Configure AWS credentials and region
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Create an S3 instance
const s3 = new AWS.S3();


// Function to upload a file to S3 bucket and return the URL of the uploaded file
const uploadFileToS3 = async (bucketName: string, body: Buffer, key: string) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: body,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
            if (err) {
                reject(err);
            } else {
                console.log(data);
                resolve(data.Location);
            }
        });
    });
}

export { uploadFileToS3 };