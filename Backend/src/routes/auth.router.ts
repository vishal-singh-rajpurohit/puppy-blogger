import { Router, } from 'express'
import { auth } from '../middleware/auth.middleware.js';
import authController from '../controllers/auth.controllers.js';

const authRouter = Router();


authRouter.route('/').get(auth, authController.authCheck);

authRouter.route('/check/username').get(authController.checkUsername);
authRouter.route('/check/email').get(authController.checkEmail);

authRouter.route('/register').post(authController.register);
authRouter.route('/login').post(authController.login);
authRouter.route('/logout').get(auth, authController.logout);

authRouter.route('/reset/password/otp').post(authController.resetPasswordOTP);
authRouter.route('/reset/password/otp/verify').post(authController.resetPasswordOTPVerify);
authRouter.route('/reset/password').post(authController.resetPassword);

export { authRouter };