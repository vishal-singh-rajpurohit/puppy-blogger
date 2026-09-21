import { User, Blog, Views, Like, Comments } from '../models/index.js';
import { auth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import APIRepsonse from '../utils/ApiResponse.js';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { success } from 'zod';

/***
 * Authorized Access
 */

const createNewBlog = asyncHandler(async (req: Request, resp: Response) => {
    try {
        if (!req.user) {
            resp.status(401).json(new APIRepsonse(401, null, "Unautharized Access"))
            return;
        }

        const user = await User.findById(req.user?._id);

        if (!user) {
            resp.status(404).json(new APIRepsonse(404, null, "User not found"));
            return;
        }

        const { title, body } = req.body;

        if (!title || !body) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Title and Body both requied"))
            return;
        }

        const newBlog = new Blog({
            title,
            body,
            author: user._id
        })

        await newBlog.save();

        if (!newBlog) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Error in creating blog"))
            return;
        }

        resp.status(201).json(new APIRepsonse(201, {
            success: true,
            blog: newBlog
        }, "Blog Created"))

    } catch (error) {
        console.log(error);
        throw new Error("Error in Creating new Blog")
    }
});

const updatePost = asyncHandler(async (req: Request, resp: Response) => {
    try {
        if (!req.user) {
            resp.status(401).json(new APIRepsonse(401, null, "Unautharized Access"))
            return;
        }

        const user = await User.findById(req.user?._id);

        if (!user) {
            resp.status(404).json(new APIRepsonse(404, null, "User not found"));
            return;
        }

        const { blogId, body } = req.body;

        if (!blogId || !body) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "blogId and Body both requied"))
            return;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(new mongoose.Types.ObjectId(blogId), {
            body
        }, { new: true });

        if (!updatedBlog) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Error in Updating blog"))
            return;
        }

        resp.status(201).json(new APIRepsonse(201, {
            success: true,
            blog: updatedBlog
        }, "Blog Updated"))

    } catch (error) {
        console.log(error);
        throw new Error("Error in Updating Blog")
    }
});

const changePostStatus = asyncHandler(async (req: Request, resp: Response) => {
    try {
        if (!req.user) {
            resp.status(401).json(new APIRepsonse(401, null, "Unautharized Access"))
            return;
        }

        const user = await User.findById(req.user?._id);

        if (!user) {
            resp.status(404).json(new APIRepsonse(404, null, "User not found"));
            return;
        }

        const { blogId, status } = req.body;

        if (!blogId || !status) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "blogId and status both requied"))
            return;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(new mongoose.Types.ObjectId(blogId), {
            status
        }, { new: true });

        if (!updatedBlog) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Error in Updating blog"))
            return;
        }

        resp.status(201).json(new APIRepsonse(201, {
            success: true,
            blog: updatedBlog
        }, "Blog Updated"))

    } catch (error) {
        throw new Error("Error in Publishing Blog")
    }
});

/**
 * Like, Comment
 */

const getFeed = asyncHandler(async (req: Request, resp: Response) => {
    try {
        // const user = req.user;

        const page = req.params.page;
        const limit = req.params.limit;

        if (!page || !limit) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Slug Required"))
            return
        }

        const blogs = await Blog.aggregate([
            {
                $match: {
                    status: "published"
                }
            },
            {
                $skip: Number(page) * (Number(limit) + 1)
            },
            {
                $limit: Number(limit) + 1
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "postId",
                    as: "comments"
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "postId",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "views",
                    localField: "_id",
                    foreignField: "postId",
                    as: "views"
                }
            },
            {
                $unwind: {
                    path: "$author"
                }
            },
            {
                $project: {
                    status: 0,
                    createdAt: 0,
                    blog: 0
                }
            },
            {
                $addFields: {
                    commentsCount: {
                        $size: "$comments"
                    },
                    likesCount: {
                        $size: "$likes"
                    },
                    viewsCount: {
                        $size: "$views"
                    }
                }
            },
            {
                $project: {
                    comments: 0,
                    views: 0,
                    likes: 0,
                    body: 0
                }
            },
            {
                $project: {
                    'author.email': 0,
                    'author.password_hash': 0,
                    'author.createdAt': 0,
                    'author.updatedAt': 0,
                    'author.refresh_token': 0,
                    'author.__v': 0,
                }
            },
        ]);

        console.log(blogs)

        if (!blogs[0]) {
            resp.status(404).json(new APIRepsonse(404, { success: false }, "Blog not found"))
            return
        }

        resp.status(200).json(new APIRepsonse(200, {
            success: true,
            blog: blogs
        }, "Blogs Found"))
    } catch (error) {
        console.log(error);
        throw new Error("Error in Publishing Blog")
    }
});

const getBlog = asyncHandler(async (req: Request, resp: Response) => {
    try {
        const user = req.user;

        const slug = req.params.slug as string;

        if (!slug) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Slug Required"))
            return
        }

        const blogData = await Blog.aggregate([
            {
                $match: {
                    slug: slug.trim()
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'likes'
                }
            },
            {
                $lookup: {
                    from: 'views',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'views'
                }
            },
            {
                $unwind: {
                    path: '$author',
                }
            },
            {
                $project: {
                    slug: 0,
                    status: 0,
                    createdAt: 0,
                    excerpt: 0,
                }
            },
            {
                $addFields: {
                    commentsCount: {
                        $size: "$comments"
                    },
                    likesCount: {
                        $size: "$likes"
                    },
                    viewsCount: {
                        $size: "$views"
                    },
                }
            },
            {
                $project: {
                    comments: 0,
                    views: 0,
                    likes: 0,
                    excerpt: 0,
                }
            },
            {
                $project: {
                    'author.email': 0,
                    'author.password_hash': 0,
                    'author.createdAt': 0,
                    'author.updatedAt': 0,
                    'author.refresh_token': 0,
                    'author.__v': 0,
                }
            }
        ]);

        const blog = blogData[0];

        if (!blog) {
            resp.status(404).json(new APIRepsonse(404, { success: false }, "Blog not found"))
            return
        }

        if (user) {
            const view = new Views({
                userId: user._id,
                postId: blog._id
            });
            await view.save();

            if (!view) {
                resp.status(400).json(new APIRepsonse(400, { success: false }, "Internal Server Error"))
                return
            }

            const isWatched = await Views.findOne({
                postId: blog._id,
                userId: user._id
            })

            resp.status(200).json(new APIRepsonse(200, {
                success: true,
                blog: blog,
                isViewed: !!isWatched
            }, "Blog Found"))
            return
        }

        const view = new Views({
            postId: blog._id
        });
        await view.save();

        if (!view) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Internal Server Error"))
            return
        }

        resp.status(200).json(new APIRepsonse(200, {
            success: true,
            blog: blog
        }, "Blog Found"))
    } catch (error) {
        console.log(error);
        throw new Error("Error in Publishing Blog")
    }
});

const likeBlog = asyncHandler(async (req: Request, resp: Response) => {
    try {
        if (!req.user) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Unautharized Access"));
            return
        }

        const id = req.params.id as string;

        if (!id) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Slug Required"))
            return
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Unautharized Access"));
            return
        }


        const blog = await Blog.findById(id);

        if (!blog) {
            resp.status(404).json(new APIRepsonse(404, { success: false }, "Blog not found"))
            return
        }

        const isLiked = await Like.exists({
            postId: blog._id,
            userId: user._id
        })


        if (isLiked) {
            resp.status(209).json(new APIRepsonse(209, { success: true }, "Already Liked"))
            return
        }

        const like = new Like({
            postId: blog._id,
            userId: user._id
        })

        await like.save()

        if (!like) {
            resp.status(404).json(new APIRepsonse(404, { success: false }, "Error in creating Like"))
            return
        }

        resp.status(200).json(new APIRepsonse(200, { success: true }, "Liked Successfully"))

    } catch (error) {
        console.log(error);
        throw new Error("Error in Like Blog")
    }
});

const dislikeBlog = asyncHandler(async (req: Request, resp: Response) => {
    try {
        if (!req.user) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Unautharized Access"));
            return
        }

        const id = req.params.id as string;

        if (!id) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Slug Required"))
            return
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Unautharized Access"));
            return
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            resp.status(404).json(new APIRepsonse(404, { success: false }, "Blog not found"))
            return
        }

        const like = await Like.findOneAndDelete({
            postId: blog._id,
            userId: user._id
        })


        if (!like) {
            resp.status(404).json(new APIRepsonse(404, { success: false }, "Error in creating Like"))
            return
        }

        resp.status(200).json(new APIRepsonse(200, { success: true }, "Liked Successfully"))

    } catch (error) {
        console.log(error);
        throw new Error("Error in Like Blog")
    }
});

const commentBlog = asyncHandler(async (req: Request, resp: Response) => {
    try {
        if (!req.user) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Unautharized Access"))
            return
        }

        const id = req.params.id as string;

        if (!id) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Slug Required"))
            return
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Unautharized Access"));
            return
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            resp.status(404).json(new APIRepsonse(404, { success: false }, "Blog not found"))
            return
        }

        const { comment } = req.body;

        if (!comment) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Comment Required"))
            return
        }

        const newComment = new Comments({
            postId: blog._id,
            userId: user._id,
            comment: comment
        })

        await newComment.save()

        if (!newComment) {
            resp.status(404).json(new APIRepsonse(404, { success: false }, "Error in creating Like"))
            return
        }

        resp.status(200).json(new APIRepsonse(200, {
            success: true,
            comment: newComment
        }, "Liked Successfully"))

    } catch (error) {
        console.log(error);
        throw new Error("Error in Comment Blog")
    }
});

const getComments = asyncHandler(async (req: Request, resp: Response) => {
    try {
        const id = req.params.id as string;

        if (!id) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Blog Id not found"));
            return;
        }

        const comments = await Blog.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'comments',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user',
                                pipeline: [
                                    {
                                        $project: {
                                            password_hash: 0,
                                            access_token: 0,
                                            refresh_token: 0,
                                            createdAt: 0,
                                            updatedAt: 0,
                                            email: 0,
                                            name: 0,
                                            __v: 0
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$comments',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    comments: 1
                }
            }
        ])

        if (!comments) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, 'Cannot get comments'))
        }

        resp.status(200).json(new APIRepsonse(400, {
            comments: comments,
            success: true
        }, 'Here are comments'))

    } catch (error) {
        console.log(error)
        throw new Error("Error in getting comments");
    }
});


export default {
    createNewBlog,
    updatePost,
    changePostStatus,
    getFeed,
    getBlog,
    likeBlog,
    dislikeBlog,
    commentBlog,
    getComments
}