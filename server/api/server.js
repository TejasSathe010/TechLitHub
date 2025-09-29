import express from 'express';
import 'dotenv/config';
import { nanoid } from 'nanoid';
import cors from 'cors';
import serverless from 'serverless-http';
import { configureS3, configureFirebase, configureMongoDB } from '../config/config.js';

import authRoutes from '../routes/authRoutes.js';
import blogRoutes from '../routes/blogRoutes.js';
import commentRoutes from '../routes/commentRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());

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
};

// upload image URL route
app.get('/get-upload-url', async (req, res) => {
  try {
    const url = await generateUploadURL();
    res.status(200).json({ uploadURL: url });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use('/auth', authRoutes);
app.use('/blog', blogRoutes);
app.use('/comment', commentRoutes);
// app.use('/notification', notificationRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// ⬇️ EXPORT for Vercel (instead of app.listen)
export const handler = serverless(app);
