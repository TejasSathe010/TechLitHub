import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { nanoid } from 'nanoid';

const router = express.Router();

router.post('/latest-blogs', (req, res) => {
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

router.post("/all-latest-blogs-count", (req, res) => {
    Blog.countDocuments({ draft: false })
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
})

router.get('/trending-blogs', (req, res) => {
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

router.post('/search-blogs', (req, res) => {
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

router.post("/search-blogs-count", (req, res) => {
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

router.post("/create-blog", authMiddleware, (req, res) => {
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

router.post('/get-blog', (req, res) => {
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

router.post('/like-blog', authMiddleware, (req, res) => {
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
            like.save().then(notification => {
                return res.status(200).json({ liked_by_user: true })
            })
        } else {
            Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
            .then(data => {
                return res.status(200).json({ liked_by_user: false })
            })
            .catch(err => {
                return res.status(500).json({ "error": err.message });
            })
        }
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
});

router.post('/isliked-by-user', authMiddleware, (req, res) => {
    let user_id = req.user;

    let { _id } = req.body;

    Notification.exists({ user: user_id, type: "like", blog: _id })
    .then(result => {
        return res.status(200).json({ result });
    })
    .catch(err => {
        return res.status(500).json({ "error": err.message });
    })
});

export default router;
