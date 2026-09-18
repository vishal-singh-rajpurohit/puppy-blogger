import type mongoose from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user?: {
            _id: mongoose.Types.ObjectId,
            name: string,
            username: string,
            email: string
        }}
    }
}