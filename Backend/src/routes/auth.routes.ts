import { Router, } from 'express'
import { auth } from '../middleware/auth.middleware.js';
import authController from '../controllers/auth.controller.js';

const authRouter = Router();


authRouter.route('/').get(auth, authController.authCheck);

authRouter.route('/check/username').post(authController.checkUsername);
authRouter.route('/check/email').post(authController.checkEmail);

authRouter.route('/register').post(authController.registerEmail);
authRouter.route('/register/detail').put(auth, authController.registerDetails);

authRouter.route('/login').post(authController.login);
authRouter.route('/logout').get(auth, authController.logout);
authRouter.route('/posts/get-my-posts').get(auth, authController.getMyPosts);

authRouter.route('/oauth').post(authController.oauthLogin);

authRouter.route('/reset/password/otp').post(authController.resetPasswordOTP);
authRouter.route('/reset/password/otp/verify').post(authController.resetPasswordOTPVerify);
authRouter.route('/reset/password').post(authController.resetPassword);

export { authRouter };