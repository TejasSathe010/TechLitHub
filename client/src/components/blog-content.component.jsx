import React, { useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/nord.css';

const Img = ({ url, caption }) => (
    <div>
        <img src={url} alt={caption || 'Image'} />
        {caption?.length ? (
            <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">{caption}</p>
        ) : null}
    </div>
);

const Quote = ({ quote, caption }) => (
    <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple">
        <p className="text-xl leading-10 md:text-2xl">{quote}</p>
        {caption?.length ? <p className="w-full text-purple text-base">{caption}</p> : null}
    </div>
);

const List = ({ style, items }) => {
    console.log('Items:', items); // Log items to check structure
    return (
        <ol className={`pl-5 ${style === "ordered" ? "list-decimal" : "list-disc"}`}>
            {items.map((listItem, i) => (
                <li key={i} className="my-4">
                    {typeof listItem === 'string' ? (
                        listItem
                    ) : (
                        <div>
                            {listItem.content && (
                                <div dangerouslySetInnerHTML={{ __html: listItem.content }}></div>
                            )}
                            {listItem.items && listItem.items.length > 0 && (
                                <List style={listItem.style} items={listItem.items} />
                            )}
                        </div>
                    )}
                </li>
            ))}
        </ol>
    );
};


const Checklist = ({ items }) => (
    <ul className="pl-5 list-none">
        {items.map((item, i) => (
            <li key={i} className="flex items-center my-2">
                <input type="checkbox" checked={item.checked} readOnly className="mr-2" />
                <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
            </li>
        ))}
    </ul>
);

const Table = ({ content }) => (
    <table className="table-auto border-collapse border border-gray-400 w-full text-left">
        <tbody>
            {content.map((row, i) => (
                <tr key={i}>
                    {row.map((cell, j) => (
                        <td key={j} className="border border-gray-300 p-2" dangerouslySetInnerHTML={{ __html: cell }}></td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
);

const Embed = ({ embed, caption }) => (
    <div className="my-5">
        <div dangerouslySetInnerHTML={{ __html: embed }}></div>
        {caption?.length ? <p className="text-center text-sm text-gray-600 mt-2">{caption}</p> : null}
    </div>
);

const Warning = ({ title, message }) => (
    <div className="border-l-4 border-yellow-500 bg-yellow-100 p-4">
        <p className="font-bold text-yellow-600">{title}</p>
        <p>{message}</p>
    </div>
);

const Delimiter = () => <div className="text-center my-4 text-gray-500">***</div>;

const BlogContent = ({ block }) => {
    const { type, data } = block;

    useEffect(() => {
        // Highlight the code blocks
        hljs.highlightAll();
    }, []);

    if (type === 'paragraph') {
        return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
    }

    if (type === 'header') {
        const HeadingTag = `h${data.level}`;
        const className = `text-${data.level === 1 ? '5xl' : data.level === 2 ? '4xl' : '3xl'} font-bold`;
        return <HeadingTag className={className} dangerouslySetInnerHTML={{ __html: data.text }}></HeadingTag>;
    }

    if (type === 'image') {
        return <Img url={data.file.url} caption={data.caption} />;
    }

    if (type === 'quote') {
        return <Quote quote={data.text} caption={data.caption} />;
    }

    if (type === 'list') {
        return <List style={data.style} items={data.items} />;
    }

    if (type === 'checklist') {
        return <Checklist items={data.items} />;
    }

    if (type === 'table') {
        return <Table content={data.content} />;
    }

    if (type === 'embed') {
        return <Embed embed={data.embed} caption={data.caption} />;
    }

    if (type === 'warning') {
        return <Warning title={data.title} message={data.message} />;
    }

    if (type === 'delimiter') {
        return <Delimiter />;
    }

    if (type === 'code') {
        return (
            <pre>
                <code className="hljs">{data.code}</code>
            </pre>
        );
    }    

    if (type === 'raw') {
        return <div dangerouslySetInnerHTML={{ __html: data.html }}></div>;
    }

    return null;
};

export default BlogContent;
