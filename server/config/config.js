import mongoose from 'mongoose';
import admin from 'firebase-admin';
import aws from 'aws-sdk';
import fs from 'fs';
import 'dotenv/config';

export const configureFirebase = () => {
    const serviceAccountKey = JSON.parse(
        fs.readFileSync(new URL('../tech-blog-site-1b8f1-firebase-adminsdk-oet75-f000004a51.json', import.meta.url), 'utf-8')
    );
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
    });
};

export const configureMongoDB = () => {
    const MONGODB_URI = process.env.DB_LOCATION;
    mongoose.connect(MONGODB_URI, {
        autoIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB', error);
    });
};

export const configureS3 = () => {
    process.env.AWS_SDK_LOAD_CONFIG = '1';
    return new aws.S3({
        region: process.env.AWS_REGION || 'us-east-2',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY,
    });
};
