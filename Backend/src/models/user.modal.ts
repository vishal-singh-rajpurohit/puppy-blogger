import {
    Schema,
    model,
    type UpdateQuery
} from "mongoose";

import jwt, {
    type SignOptions
} from "jsonwebtoken";

import bcrypt from "bcrypt";
import { z } from "zod";


/* =========================
   User Data
========================= */

const UserValidationSchema = z.object({
    name: z.string().min(2).max(20).trim(),

    username: z
        .string()
        .min(2)
        .max(20)
        .trim()
        .toLowerCase(),

    email: z
        .string()
        .email("Must Provide a Valid Email"),

    password_hash: z
        .string()
        .min(8)
        .trim(),

    refresh_token: z.string().optional(),

    access_token: z.string().optional(),

    createdAt: z.date().optional(),

    updatedAt: z.date().optional()
});

type IUser = z.infer<typeof UserValidationSchema>;


/* =========================
   User Methods
========================= */

interface IUserMethods {

    isPasswordCorrect(
        password: string
    ): Promise<boolean>;

    createAccessToken(): Promise<string>;

    createRefreshToken(): Promise<string>;

}


/* =========================
   Schema
========================= */

const UserSchema = new Schema<
    IUser,
    any,
    IUserMethods
>(
    {
        name: {
            type: String,
            required: true
        },

        username: {
            type: String,
            required: true,
            unique: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password_hash: {
            type: String,
            required: true
        },

        refresh_token: {
            type: String
        },

        access_token: {
            type: String
        }
    },
    {
        timestamps: true
    }
);


/* =========================
   Password Hashing
========================= */

UserSchema.pre("save", async function () {

    if (!this.isModified("password_hash")) {
        return;
    }

    this.password_hash = await bcrypt.hash(
        this.password_hash,
        10
    );
});


UserSchema.pre(
    "findOneAndUpdate",
    async function () {

        const update =
            this.getUpdate() as UpdateQuery<IUser>;

        if (!update.password_hash) {
            return;
        }

        update.password_hash =
            await bcrypt.hash(
                update.password_hash,
                10
            );
    }
);


/* =========================
   Password Verification
========================= */

UserSchema.methods.isPasswordCorrect =
    async function (password: string) {

        return bcrypt.compare(
            password,
            this.password_hash
        );
    };


/* =========================
   Access Token
========================= */

UserSchema.methods.createAccessToken =
    async function () {

        const secret =
            process.env.ACCESS_TOKEN_SECRET;

        const expiration =
            process.env.ACCESS_TOKEN_EXP;

        if (!secret || !expiration) {
            throw new Error(
                "Must Pass Token Secrets"
            );
        }

        const expiresIn =
            expiration as NonNullable<
                SignOptions["expiresIn"]
            >;

        return jwt.sign(
            {
                _id: this._id,
                username: this.username
            },
            secret,
            {
                expiresIn
            }
        );
    };


/* =========================
   Refresh Token
========================= */

UserSchema.methods.createRefreshToken =
    async function () {

        const secret =
            process.env.REFRESH_TOKEN_SECRET;

        const expiration =
            process.env.REFRESH_TOKEN_EXP;

        if (!secret || !expiration) {
            throw new Error(
                "Must Pass Token Secrets"
            );
        }

        const expiresIn =
            expiration as NonNullable<
                SignOptions["expiresIn"]
            >;

        return jwt.sign(
            {
                _id: this._id,
                username: this.username
            },
            secret,
            {
                expiresIn
            }
        );
    };


/* =========================
   Model
========================= */

export const User =
    model<IUser, any, IUserMethods>(
        "User",
        UserSchema
    );