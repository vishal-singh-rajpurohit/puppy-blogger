import mongoose, { model, Schema, Types } from "mongoose"
import {z} from "zod"


const CommentsSchemaValidation = z.object({
    userId: z.string().refine((val)=> Types.ObjectId.isValid(val), {
        message: "Invalid User Id"
    }),
    postId: z.string().refine((val)=> Types.ObjectId.isValid(val), {
        message: "Invalid Post Id"
    }),
    createdAt: z.date(),
    updatedAt: z.date()
});

type IComments = z.infer<typeof CommentsSchemaValidation>;

const CommentSchema = new Schema<Omit<IComments, 'userId' | 'postId'> & {
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


export const Comments = model('Comment', CommentSchema)