import { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        access_token?: string;
        refresh_token?: string;
        incomplete?: boolean;
        error?: string;
        user: {
            id?: string;
            username?: string;
        } & DefaultSession["user"];
    }

    interface User {
        accessToken?: string;
        refreshToken?: string;
        incomplete?: boolean;
        username?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        access_token?: string;
        refresh_token?: string;
        incomplete?: boolean;
        accessTokenExpires?: number;
        error?: string;
        username?: string;
    }
}
