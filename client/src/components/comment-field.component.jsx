import React, { useContext, useState } from 'react';
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { UserContext } from '../App';
import { BlogContext } from '../pages/blog.page';


const CommentField = ({ action }) => {
    const [comment, setComment] = useState('');
    let { blog, blog: { _id, author: { _id: blog_author }, comments, comments: { results: commentsArr }, activity, activity: { total_comments, total_parent_comments } }, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext);
    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);

    const handleComment = () => {
        if (!access_token) {
            return toast.error("Login first to leave a comment");
        }

        if (!comment.length) {
            return toast.error("Write something to leave a comment");
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", { _id, blog_author, comment }, { 
            headers: {
                'Authorization': `Bearer ${ access_token }`
            }
         })
        .then(async ({ data }) => { 
            console.log('Data', data)
            setComment("");
            data.commented_by = { personal_info: { username, profile_img, fullname } };
            data.childrenLevel = 0;
            let newCommentArr = [ data, ...commentsArr ];
            console.log('newCommentArr', newCommentArr);
            let parentCommentIncrementVal = 1;
            setBlog({ ...blog, comments: { ...comments, results: newCommentArr }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementVal } });
            setTotalParentCommentsLoaded(prev => prev + parentCommentIncrementVal);
        })
        .catch(err => {
            console.log(err);
        });
    }
  return (
    <>
        <Toaster />
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder='Leave a comment....' className='input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto' />
        <button className='btn-dark mt-5 px-10' onClick={handleComment}>{ action }</button>
    </>
  )
}

export default CommentField;