import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import InPageNavigation from '../components/inpage-navigation.component';
import Loader from '../components/loader.component';
import AnimationWrapper from '../common/page-animation';
import BlogPostCard from '../components/blog-post.component';
import NoDataMessage from '../components/nodata.component';
import LoadMoreDataBtn from '../components/load-more.component';
import { filterPaginationData } from '../common/filter-pagination-data';
import UserCard from '../components/usercard.component';


const SearchPage = () => {
    let { query } = useParams();
    const [blogs, setBlogs] = useState(null);
    const [users, setUsers] = useState(null);

    const searchBlogs = ({ page = 1, createNewArray = false }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs", { query, page })
        .then(async ({ data }) => { 
            let formateData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/blog/search-blogs-count",
                dataToSend: { query },
                createNewArray
            })
            setBlogs(formateData);
        })
        .catch(err => {
            console.log(err);
        }); 
    }

    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/auth/search-users", { query })
        .then(async ({ data: {users} }) => { 
            setUsers(users);
        })
        .catch(err => {
            console.log(err);
        }); 
    }

    const resetState = () => {
        setBlogs(null);
        setUsers(null);
    }

    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, createNewArray: true });
        fetchUsers();
    }, [query]);

    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader /> : 
                    users.length ? users.map((user, i) => {
                        return <AnimationWrapper key={i} transition={{ duration: 1, delay: i*0.08 }}>
                            <UserCard user={user} />
                        </AnimationWrapper>
                    })
                    :
                    <NoDataMessage message="No user found" />
                }
            </>
        )
    }

  return (
    <section className='h-cover flex justify-center gap-10'>
        <div className='w-full'>
            <InPageNavigation routes={[`Search results from "${query}"`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]}>
                <>
                {blogs === null ? (
                    <Loader />
                ) : (
                    blogs.results.length ? 
                    blogs.results.map((blog, i) => {
                        return (
                        <AnimationWrapper
                            transition={{ duration: 1, delay: i * 0.1 }}
                            key={i}
                        >
                            <BlogPostCard
                            content={blog}
                            author={blog.author.personal_info}
                            />
                        </AnimationWrapper>
                        );
                    })
                    :
                    <NoDataMessage message="No blogs published" />
                )}
                <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
                </>
                <UserCardWrapper />
            </InPageNavigation>
        </div>
        <div className='min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>
            <h1 className='font-medium text-xl mb-8'>User related to search <i className="fi fi-rr-user mt-1"></i></h1>
            <UserCardWrapper />
        </div>
    </section>
  )
}

export default SearchPage;