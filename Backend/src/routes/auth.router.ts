import {Router} from 'express'
import APIRepsonse from '../utils/ApiResponse.js';
import { User } from '../models/index.js';


const auth = Router();


auth.get('/', async function (req, resp){
    try {
        if(!req.user){
            resp.status(401).json(new APIRepsonse(401, null, "Unautharized Access"))
            return;
        }

        const user = await User.findById(req.user?._id);

        if(!user){
            resp.status(404).json(new APIRepsonse(404, null, "User not found"));
            return;
        }

        const ACCESS_TOKEN = await user.createAccessToken()
        const REFRESH_TOKEN  = await user.createRefreshToken()

        if(!ACCESS_TOKEN || !REFRESH_TOKEN){
            resp.status(501).json(new APIRepsonse(501, null, "Cannot Generate ACCESS_TOKEN or REFRESH_TOKEN"));
            return;
        }

    } catch (error) {
        if(error instanceof Error) throw new Error("Error in Auth Cheking: " + error.message)
        throw new Error("Error in Auth Cheking: ")
    }
})