import type { Request, Response } from 'express'
import { User, OTPs } from "../models/index.js"
import { cookieOptions } from '../config/settings.js';
import APIRepsonse from '../utils/ApiResponse.js';
import { decodeAccessToken, decodeRefreshToken, genrateResetToken } from '../utils/tokens.utils.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { sendOtp, sendPasswordResetSuccessEmail, sendRegistrationEmail } from '../utils/Resend.js';


function genrateOTP(): string {
    const otp = Math.floor(Math.random() * 1000000);
    return String(otp).padStart(6, '0');
}


/**
 * Basic Authentication Controllers
 */

const authCheck = asyncHandler(async (req: Request, resp: Response,) => {
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

        const ACCESS_TOKEN = await user.createAccessToken()
        const REFRESH_TOKEN = await user.createRefreshToken()

        if (!ACCESS_TOKEN || !REFRESH_TOKEN) {
            resp.status(501).json(new APIRepsonse(501, null, "Cannot Generate ACCESS_TOKEN or REFRESH_TOKEN"));
            return;
        }

        const decodedAccessToken = await decodeAccessToken(ACCESS_TOKEN);
        const decodedRefreshToken = await decodeRefreshToken(REFRESH_TOKEN);

        if (!decodedAccessToken || !decodedRefreshToken) {
            resp.status(501).json(new APIRepsonse(501, null, "INTERNAL SERVER ERROR"));
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                access_token: decodedAccessToken,
                refresh_token: decodedRefreshToken
            }
        );

        if (!updatedUser) {
            resp.status(501).json(new APIRepsonse(501, null, "Error updating User"))
            return;
        }

        const finalUser = await User.findById(updatedUser._id).select(" -refresh_token -password_hash -access_token")

        if (!finalUser) {
            resp.status(501).json(new APIRepsonse(501, null, "Internal Server Error"))
            return;
        }

        resp.cookie("ACCESS_TOKEN", ACCESS_TOKEN, cookieOptions)
        resp.cookie("REFRESH_TOKEN", REFRESH_TOKEN, cookieOptions)

        resp.status(200).json(new APIRepsonse(200, {
            user: finalUser
        }, "User Logged In Successfully"))

    } catch (error) {
        if (error instanceof Error) throw new Error("Error in Auth Cheking: " + error.message)
        throw new Error("Error in Auth Cheking: ")
    }

});

const checkEmail = asyncHandler(async (req: Request, resp: Response,) => {
    try {

        const { email } = req.body;

        if (!email) {
            resp.status(400).json(new APIRepsonse(400, null, "Username required"))
            return;
        }

        const isUserExists = await User.exists({ email: email.trim().toLowerCase() })

        if (isUserExists) {
            resp.status(200).json(new APIRepsonse(409, { avilable: false }, "email is already taken"));
            return;
        }


        resp.status(409).json(new APIRepsonse(409, { avilable: true }, "email is avilable"));

    } catch (error) {
        if (error instanceof Error) throw new Error("Error in Auth Cheking: " + error.message)
        throw new Error("Error in Auth Cheking: ")
    }
});

const checkUsername = asyncHandler(async (req: Request, resp: Response,) => {
    try {

        const { username } = req.body;

        if (!username) {
            resp.status(400).json(new APIRepsonse(400, null, "Username required"))
            return;
        }

        const isUserExists = await User.exists({ username: username.trim().toLowerCase() })

        if (isUserExists) {
            resp.status(200).json(new APIRepsonse(409, { avilable: false }, "Username is already taken"));
            return;
        }


        resp.status(409).json(new APIRepsonse(409, { avilable: true }, "Username is avilable"));

    } catch (error) {
        if (error instanceof Error) throw new Error("Error in Auth Cheking: " + error.message)
        throw new Error("Error in Auth Cheking: ")
    }
});


const register = asyncHandler(async (req: Request, resp: Response,) => {
    try {

        const { name, username, email, password, conform_password } = req.body;

        if (!name || !username || !email || !password || !conform_password) {
            resp.status(400).json(new APIRepsonse(400, null, "all data required"))
            return;
        }

        if (password.trim() !== conform_password.trim()) {
            resp.status(400).json(new APIRepsonse(400, null, "passwords are not matching"))
            return;
        }

        const isUserExists = await User.exists({
            $or: [
                { username: username.trim().toLowerCase() },
                { email: email.trim().toLowerCase() }
            ]
        })

        if (isUserExists) {
            resp.status(409).json(
                new APIRepsonse(409, null, "Username or email already exists")
            );
            return;
        }

        const user = new User({
            name,
            username,
            email,
            password_hash: password
        });
        await user.save();

        const ACCESS_TOKEN = await user.createAccessToken()
        const REFRESH_TOKEN = await user.createRefreshToken()

        if (!ACCESS_TOKEN || !REFRESH_TOKEN) {
            resp.status(501).json(new APIRepsonse(501, null, "Cannot Generate ACCESS_TOKEN or REFRESH_TOKEN"));
            return;
        }

        const decodedAccessToken = await decodeAccessToken(ACCESS_TOKEN);
        const decodedRefreshToken = await decodeRefreshToken(REFRESH_TOKEN);

        if (!decodedAccessToken || !decodedRefreshToken) {
            resp.status(501).json(new APIRepsonse(501, null, "INTERNAL SERVER ERROR"));
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    access_token: ACCESS_TOKEN,
                    refresh_token: REFRESH_TOKEN
                }
            }
        );

        if (!updatedUser) {
            resp.status(501).json(new APIRepsonse(501, null, "Error updating User"))
            return;
        }

        resp.cookie("ACCESS_TOKEN", ACCESS_TOKEN, cookieOptions)
        resp.cookie("REFRESH_TOKEN", REFRESH_TOKEN, cookieOptions)

        const finalUser = await User.findById(updatedUser._id).select(" -refresh_token -password_hash -access_token");

        if (!finalUser) {
            resp.status(501).json(new APIRepsonse(501, null, "Internal Server Error"))
            return;
        }

        await sendRegistrationEmail(finalUser.email, finalUser.username)

        resp.status(200).json(new APIRepsonse(200, {
            user: finalUser
        }, "User Registered Successfully"))

    } catch (error) {
        if (error instanceof Error) throw new Error("Error in Auth Cheking: " + error.message)
        throw new Error("Error in Auth Cheking: ")
    }
});

const login = asyncHandler(async (req: Request, resp: Response,) => {
    try {

        const { username, email, password } = req.body;

        if (!(username || email) || !password) {
            resp.status(400).json(new APIRepsonse(400, null, "all data required"))
            return;
        }

        const isUserExists = await User.exists({
            $or: [
                { username: username },
                { email: email }
            ]
        })

        if (!isUserExists) {
            resp.status(409).json(
                new APIRepsonse(409, null, "Invalid Username or Email Address")
            );
            return;
        }

        const user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if (!user) {
            resp.status(501).json(
                new APIRepsonse(409, null, "Internal Server Error")
            );
            return;
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            resp.status(401).json(
                new APIRepsonse(409, null, "Unauthrized Access")
            );
            return;
        }


        const ACCESS_TOKEN = await user.createAccessToken()
        const REFRESH_TOKEN = await user.createRefreshToken()

        if (!ACCESS_TOKEN || !REFRESH_TOKEN) {
            resp.status(501).json(new APIRepsonse(501, null, "Cannot Generate ACCESS_TOKEN or REFRESH_TOKEN"));
            return;
        }

        const decodedAccessToken = await decodeAccessToken(ACCESS_TOKEN);
        const decodedRefreshToken = await decodeRefreshToken(REFRESH_TOKEN);

        if (!decodedAccessToken || !decodedRefreshToken) {
            resp.status(501).json(new APIRepsonse(501, null, "INTERNAL SERVER ERROR"));
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    access_token: ACCESS_TOKEN,
                    refresh_token: REFRESH_TOKEN
                }
            }
        );

        if (!updatedUser) {
            resp.status(501).json(new APIRepsonse(501, null, "Error updating User"))
            return;
        }

        resp.cookie("ACCESS_TOKEN", ACCESS_TOKEN, cookieOptions)
        resp.cookie("REFRESH_TOKEN", REFRESH_TOKEN, cookieOptions)

        const finalUser = await User.findById(updatedUser._id).select(" -refresh_token -password_hash -access_token");

        if (!finalUser) {
            resp.status(501).json(new APIRepsonse(501, null, "Internal Server Error"))
            return;
        }

        resp.status(200).json(new APIRepsonse(200, {
            user: finalUser
        }, "User Logged-In Successfully"))

    } catch (error) {
        if (error instanceof Error) throw new Error("Error in Auth Cheking: " + error.message)
        throw new Error("Error in Auth Cheking: ")
    }
});

const logout = asyncHandler(async (req: Request, resp: Response,) => {
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


        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    access_token: "",
                    refresh_token: ""
                }
            },
            {
                new: true
            }
        );

        if (!updatedUser) {
            resp.status(501).json(new APIRepsonse(501, null, "Error updating User"))
            return;
        }

        resp.clearCookie("ACCESS_TOKEN", cookieOptions)
        resp.clearCookie("REFRESH_TOKEN", cookieOptions)

        resp.status(200).json(new APIRepsonse(200, null, "Logged out successfully"))

    } catch (error) {
        if (error instanceof Error) throw new Error("Error in Auth Cheking: " + error.message)
        throw new Error("Error in Auth Cheking: ")
    }

});

/**
 * Reset Password Controllers
 */

const resetPasswordOTP = asyncHandler(async (req: Request, resp: Response,) => {
    try {
        const { email } = req.body;

        if (!email) {
            resp.status(400).json(new APIRepsonse(400, { success: false }, "Email Required"))
            return;
        }

        const user = await User.findOne({ email });

        if (!user) {
            resp.status(501).json(new APIRepsonse(501, { success: false }, "Invalid Email Address"));
            return;
        }

        const OTP = genrateOTP();

        if (!OTP) {
            resp.status(501).json(new APIRepsonse(501, { success: false }, "Cannot Generate OTP"));
            return;
        }

        const otp = new OTPs({
            otp: OTP,
            userId: user._id,
        })

        await otp.save()

        if (!otp) {
            resp.status(501).json(new APIRepsonse(501, { success: false }, "Could not save OTP"));
            return;
        }

        try {
            await sendOtp(OTP, user.email,);
        } catch (_) {
            resp.status(501).json(new APIRepsonse(501, { success: false }, "Could not send OTP"));
            return;
        }

        resp.status(200).json(new APIRepsonse(200, { success: true }, "OTP Session initiated"))
    } catch (error) {
        if (error instanceof Error) throw new Error("Error in Getting password reste OTP: " + error.message)
        throw new Error("Error in Getting password reste OTP: ")
    }
});

const resetPasswordOTPVerify = asyncHandler(async (req: Request, resp: Response,) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Must provide OTP"));
            return;
        }

        const SOtp = await OTPs.findOne({ otp: otp })

        if (!SOtp) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Cannot find OTP in DB"));
            return;
        }

        const RESET_TOKEN = await genrateResetToken({ _id: SOtp.userId });

        if (!RESET_TOKEN) {
            resp.status(501).json(new APIRepsonse(501, { success: false }, "Cannot Generate RESET_TOKEN"));
            return;
        }

        resp.cookie('RESET_TOKEN', RESET_TOKEN, cookieOptions)
        resp.status(200).json(new APIRepsonse(200, { success: true }, "OTP Session initiated"))
    } catch (error) {
        if (error instanceof Error) throw new Error("Error in Verifying OTP: " + error.message)
        throw new Error("Error in Verifying OTP: ")
    }
});

const resetPassword = asyncHandler(async (req: Request, resp: Response) => {
    try {
        const RESET_TOKEN = req.cookies.RESET_TOKEN;

        if (!RESET_TOKEN) {
            resp.status(400).json(new APIRepsonse(401, { success: false }, "Unautharized Access"))
            return;
        }

        const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET;

        if (!RESET_PASSWORD_SECRET) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Token Secret not found"));
            return;
        }

        const decodedToken = jwt.verify(RESET_TOKEN, RESET_PASSWORD_SECRET) as JwtPayload & { _id: string };

        if (!decodedToken) {
            resp.status(501).json(new APIRepsonse(501, { success: false }, "Internal Server Error"));
            return;
        }

        const user = await User.findById({ _id: decodedToken._id });

        if (!user) {
            resp.status(501).json(new APIRepsonse(501, { success: false }, "Cannot find User"));
            return;
        }

        const { password, conform_password } = req.body;

        if (!password || !conform_password) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Must Provide passwords"));
            return;
        }

        if (password.trim() !== conform_password.trim()) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Passwords not matched"));
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            password_hash: password
        })

        if (!updatedUser) {
            resp.status(401).json(new APIRepsonse(401, { success: false }, "Passwords updated successfully"));
            return;
        }

        await sendPasswordResetSuccessEmail(user.email, {
            username: user.username,
            supportUrl: process.env.BASE_URL + "contact-us"
        });

        resp.clearCookie('RESET_TOKEN')
        resp.status(200).json(new APIRepsonse(200, { success: true }, "Password Updated successfully"))
    } catch (error) {
        if (error instanceof Error) throw new Error("Error in Reseting password: " + error.message)
        throw new Error("Error in Reseting password: ")
    }
})

export default {
    authCheck,
    checkEmail,
    checkUsername,
    register,
    login,
    logout,
    genrateResetToken,
    resetPassword,
    resetPasswordOTP,
    resetPasswordOTPVerify
}