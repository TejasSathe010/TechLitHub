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


const SearchPage = () => {
    let { query } = useParams();
    const [blogs, setBlogs] = useState(null);

    const searchBlogs = ({ page = 1, createNewArray = false }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page })
        .then(async ({ data }) => { 
            let formateData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                dataToSend: { query },
                createNewArray
            })
            setBlogs(formateData);
        })
        .catch(err => {
            console.log(err);
        }); 
    }

    const resetState = () => {
        setBlogs(null);
    }

    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, createNewArray: true });
    }, [query]);

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

            </InPageNavigation>
        </div>
    </section>
  )
}

export default SearchPage;