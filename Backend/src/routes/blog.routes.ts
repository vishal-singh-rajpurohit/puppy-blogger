import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import blogController from "../controllers/blog.controller.js";

const blogRouter = Router()

blogRouter.route('/new').post(auth, blogController.createNewBlog)
blogRouter.route('/update').put(auth, blogController.updatePost)
blogRouter.route('/publish').put(auth, blogController.changePostStatus)


blogRouter.route('/feed/:page/:limit').get(auth, blogController.getFeed)

blogRouter.route('/get/:slug').get(auth, blogController.getBlog)
blogRouter.route('/like/:id').put(auth, blogController.likeBlog)
blogRouter.route('/dislike/:id').get(auth, blogController.dislikeBlog)
blogRouter.route('/comment/:id').post(auth, blogController.commentBlog)

blogRouter.route('/comment/:id/read').get(auth, blogController.getComments)

export { blogRouter }