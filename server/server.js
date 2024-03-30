import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { nanoid } from 'nanoid';

// Local Schema Imports
import User from './Schema/User.js';

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
});

const formatDataToSend = (user) => {
    return {
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

server.listen(PORT, () => {
    console.log('listening on --> ' + PORT);
});