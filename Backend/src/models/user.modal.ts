import { Schema, Types, model, type UpdateQuery } from "mongoose"
import jwt, { type SignOptions } from 'jsonwebtoken'
import bcrypt from "bcrypt"
import { z } from "zod"

const UserValidationSchema = z.object({
    name: z.string().min(2).max(20).trim(),
    username: z.string().min(2).max(20).trim().lowercase(),
    email: z.string().email("Must Provide a Valid Email"),
    password_hash: z.string().min(8).trim(),
    refresh_token: z.string(),
    access_token: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
})

type IUser = z.infer<typeof UserValidationSchema>;

const UserSchema = new Schema<IUser>({
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
}, { timestamps: true });


UserSchema.pre("save", async function () {
    if (!this.isModified("password_hash")) {
        return;
    }
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
})

UserSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate() as UpdateQuery<IUser>;
    if (!update.password_hash) {
        return;
    }
    update.password_hash = await bcrypt.hash(update.password_hash, 10);
    return;
});


UserSchema.methods.isPasswordCorect = async function (password: string) {
    const result = await bcrypt.compare(this.password_hash, password)
    return result;
}

UserSchema.methods.createAccessToken = async function () {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP;

    if (!ACCESS_TOKEN_EXP || !ACCESS_TOKEN_SECRET) {
        throw new Error("Must Pass Token Secrets")
    }

    const expiresIn = ACCESS_TOKEN_EXP as NonNullable<SignOptions["expiresIn"]>;

    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn }
    )
}

UserSchema.methods.createRefreshToken = async function (password: string) {
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP;

    if (!REFRESH_TOKEN_EXP || !REFRESH_TOKEN_SECRET) {
        throw new Error("Must Pass Token Secrets")
    }

    const expiresIn = REFRESH_TOKEN_EXP as NonNullable<SignOptions["expiresIn"]>;
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        },
        REFRESH_TOKEN_SECRET,
        { expiresIn }
    )
}



export const User = model<IUser>('User', UserSchema)