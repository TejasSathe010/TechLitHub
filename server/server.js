import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import serviceAccountKey from "./tech-blog-site-1b8f1-firebase-adminsdk-oet75-7a39435154.json" assert { type: "json" };
import aws from "aws-sdk";

// Local Schema Imports
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import Notification from './Schema/Notification.js';

const server = express();
let PORT = 3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
});

// Setting up s3 bucket
const s3 = new aws.S3({
    region: 'us-east-2',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY,
});

const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: 'tech-blog-site',
        Key: imageName,
        Expires: 1000,
        ContentType: "image/jpeg"
    });
}

const verifyJWT = ( req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({ error: "No access token" });
    }
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access toke is invalid" });
        }
        req.user = user.id;
        next();
    })
}

const formatDataToSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameNotUnique = await User.exists({ "personal_info.username": username }).then((result) => result);

    isUsernameNotUnique ? username += nanoid().substring(0, 5): "";
    return username;
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


server.post("/signup", (req, res) => {
    const { fullname, email, password } = req.body;
    // validate the data from frontend
    if (fullname.length < 3) { return res.status(403).json({"error": "Fullname must be atleast 3 letters long"}); }
    if (!email.length) { res.status(403).json({"error": "Enter Email"}); }
    if (!emailRegex.test(email)) { res.status(403).json({"error": "Email is invalid"}); }
    if (!passwordRegex.test(password)) { res.status(403).json({"error": "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter"}); }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);
        let user = new User(
            {
                personal_info: { fullname, email, password: hashed_password, username }
            }
        );
        user.save().then(savedUser => {
            return res.status(200).json(formatDataToSend(savedUser));
        })
        .catch(err => {
            if (err.code == 11000) { return res.status(500).json({"error": "Email already exists"}); }
            return res.status(500).json({"error": err.message});
        })
    });
});

server.post("/signin", (req, res) => {
    const { email, password } = req.body;
    User.findOne({ "personal_info.email": email })
    .then((user) => {
        if (!user) return res.status(403).json({"error": "Email not found"});
        if (!user.google_auth) {
            bcrypt.compare(password, user.personal_info.password, (err, result) => {
                if (err) return res.status(403).json({"error": "Error occured while login, please try again"});
                if (!result) {
                    return res.status(403).json({"error": "Incorrect password"});
                } else {
                    return res.status(200).json(formatDataToSend(user));
                }
            })
        } else {
            return res.status(403).json({"error": "Account was created using google, Try logging in with google"});
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(403).json({"error": err.message});
    })
});

server.post("/google-auth", async (req, res) => {
    let { access_token } = req.body;
    getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
        let { email, name, picture } = decodedUser;
        picture = picture.replace("s96-c", "s384-c");
        let user = await User.findOne({"personal_info.email": email})
        .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
        .then((u) => { return u || null })
        .catch((err) => { return res.status(500).json({"error": err.message}) })
        if (user) { // login
            if (!user.google_auth) {
                return res.status(403).json({"error": "This email was signed up without google. Please log in with password to access the account"});
            }
        } else { //sign up
            let username = await generateUsername(email);
            user = new User({
                personal_info: { fullname: name, email, profile_img: picture, username },
                google_auth: true
            });
            await user.save().then((u) => {
                user = u;
            })
            .catch(err => {
                return res.status(500).json({ "error": err.message });
            })
        } 
        return res.status(200).json(formatDataToSend(user));  
    })
    .catch(err => {
        return res.status(500).json({ "error": "Failed to authenticate you with google. Try with some other google account" })
    })
});

server.post('/latest-blogs', (req, res) => {
    let {page} = req.body;
    let maxLimit = 5;
    Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
        return res.status(200).json({ blogs });
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
});

server.post("/all-latest-blogs-count", (req, res) => {
    Blog.countDocuments({ draft: false })
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
})

server.get('/trending-blogs', (req, res) => {
    Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs) => {
        return res.status(200).json({ blogs });
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
});

server.post('/search-blogs', (req, res) => {
    let { tag, query, author, page, limit, eliminate_blog } = req.body;
    let findQuery;
    if (tag) {
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
        findQuery = { title: new RegExp(query, 'i'), draft: false }
    } else {
        findQuery = { author, draft: false }
    }

    let maxLimit = limit ? limit : 2;

    Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
        return res.status(200).json({ blogs });
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
});

server.post("/search-blogs-count", (req, res) => {
    let { tag, author, query } = req.body;
    let findQuery;
    if (tag) {
        findQuery = { tags: tag, draft: false };
    } else if (query) {
        findQuery = { title: new RegExp(query, 'i'), draft: false }
    } else if (author) {
        findQuery = { author, draft: false }
    }  
    
    Blog.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
});

server.post("/search-users", (req, res) => {
    let { query } = req.body;
    User.find({"personal_info.username": new RegExp(query, 'i')})
    .limit(50)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then(users => {
        return res.status(200).json({ users })
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
});

server.post('/get-profile', (req, res) => {
    let { username } = req.body;
    User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updateAt -blogs")
    .then(user => {
        return res.status(200).json(user);
    })
        .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
});

server.post("/create-blog", verifyJWT, (req, res) => {
    let authorId = req.user;
    let { title, des, banner, tags, content, draft, id } = req.body;
    if (!title.length) {
        return res.status(403).json({ "error": "You must provide the title" });
    } 
    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({ "error": "You must provide blog description under 200 characters" });
        } 
        if (!banner.length) {
            return res.status(403).json({ "error": "You must provide blog banner to publish the blog" });
        } 
        if (!content.blocks.length) {
            return res.status(403).json({ "error": "You must provide the blog content to publish the blog" });
        } 
        if (!tags.length || tags.length > 10) {
            return res.status(403).json({ "error": "Provide tags inorder to publish the blog, Maximum 10" });
        }
    }  
    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if (id) {
        Blog.findOneAndUpdate({ blog_id }, { title, des, banner, content, tags, draft: draft ? Boolean(draft) : false })
        .then(() => {
            return res.status(200).json({id: blog_id});
        })
        .catch((err) => { 
            res.status(500).json({ error: err.message }) 
        });

    } else {
        let blog = new Blog({
            title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)
        });

        blog.save().then(blog => {
            let incrementVal = draft ? 0 : 1;
            User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
            .then(user => {
                return res.status(200).json({ id: blog.blog_id });
            })
            .catch(err => {
                return res.status(500).json({ error: "Failed to update total posts number" });
            })
        })
        .catch((err) => { res.status(500).json({ error: err.message }) }); 
    }
});

server.post('/get-blog', (req, res) => {
    let { blog_id, draft, mode } = req.body;
    let incrementVal = mode !== 'edit' ? 1 : 0;
    Blog.findOneAndUpdate({ blog_id }, { $inc : {"activity.total_reads": incrementVal} })
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
        User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username },  { $inc : {"account_info.total_reads": incrementVal} })
        .catch(err => {
            return res.status(500).json({ "error": err.message });
        })

        if (blog.draft && !draft) {
            return res.status(500).json({ "error": 'You can not access draft blogs' });
        }

        return res.status(200).json({ blog });
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
});

server.post('/like-blog', verifyJWT, (req, res) => {
    let user_id = req.user;
    let { _id, islikedByUser } = req.body;
    let incrementVal = !islikedByUser ? 1 : -1; 
    Blog.findOneAndUpdate({ _id }, { $inc : {"activity.total_likes": incrementVal} })
    .then((blog) => {
        if (!islikedByUser) {
            let like = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id
            })
            like.save().then(Notification => {
                return res.status(200).json({ liked_by_user: true })
            })
        }
    })
});

server.listen(PORT, () => {
    console.log('listening on --> ' + PORT);
});