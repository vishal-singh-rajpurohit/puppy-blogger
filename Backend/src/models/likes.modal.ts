import mongoose, { model, Schema, Types } from "mongoose"
import {z} from "zod"


const LikesSchemaValidation = z.object({
    userId: z.string().refine((val)=> Types.ObjectId.isValid(val), {
        message: "Invalid User Id"
    }),
    postId: z.string().refine((val)=> Types.ObjectId.isValid(val), {
        message: "Invalid Post Id"
    }),
    createdAt: z.date(),
    updatedAt: z.date()
});

type ILike = z.infer<typeof LikesSchemaValidation>;

const LikeSchema = new Schema<Omit<ILike, 'userId' | 'postId'> & {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
}>({
    postId: {
        type: mongoose.Types.ObjectId,
        ref: 'post',
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    }
},{timestamps: true})


export const Like = model('Like', LikeSchema)