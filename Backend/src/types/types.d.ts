import type mongoose from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: mongoose.Types.ObjectId;
                name?: string | undefined;
                username?: string | undefined;
                email: string;
                bio?: string | undefined;
                avatarUrl?: string | undefined;
                website?: string | undefined;
                github?: string | undefined;
                twitter?: string | undefined;
            } | undefined;
        }
    }
}