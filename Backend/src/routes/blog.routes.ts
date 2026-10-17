import { Router } from "express";
import { auth, optionalAuth } from "../middleware/auth.middleware.js";
import blogController from "../controllers/blog.controller.js";

const blogRouter = Router()

blogRouter.route('/new').post(auth, blogController.createNewBlog)
blogRouter.route('/update').put(auth, blogController.updatePost)
blogRouter.route('/publish').put(auth, blogController.changePostStatus)

blogRouter.route('/feed/:page/:limit').get(optionalAuth, blogController.getFeed)

blogRouter.route('/get/:slug').get(optionalAuth, blogController.getBlog)
blogRouter.route('/like/:id').put(auth, blogController.likeBlog).post(auth, blogController.likeBlog)
blogRouter.route('/dislike/:id').put(auth, blogController.dislikeBlog).delete(auth, blogController.dislikeBlog).get(auth, blogController.dislikeBlog).post(auth, blogController.dislikeBlog)
blogRouter.route('/comment/:id').post(auth, blogController.commentBlog)

blogRouter.route('/comment/:id/read').get(optionalAuth, blogController.getComments)

export { blogRouter }