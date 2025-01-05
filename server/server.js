import express from 'express';
import 'dotenv/config';
import { nanoid } from 'nanoid';
import cors from 'cors';
import { configureS3, configureFirebase, configureMongoDB } from './config/config.js';

import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';

const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.json());
server.use(cors());

configureMongoDB();
configureFirebase();
const s3 = configureS3();

const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imageName,
        Expires: 1000,
        ContentType: "image/jpeg"
    });
}

// upload image URL route
server.get('/get-upload-url', (req, res) => {
    generateUploadURL().then(url => {
        res.status(200).json({ uploadURL: url })
        })
        .catch((err) => {
            console.log(err.message);
            return res.status(500).json({ error: err.message });
    });
});

server.use('/auth', authRoutes);
server.use('/blog', blogRoutes);
server.use('/comment', commentRoutes);
// server.use('/notification', notificationRoutes);

server.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});