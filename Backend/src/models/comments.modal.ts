import mongoose, { model, Schema, Types } from "mongoose"
import { z } from "zod"


const CommentsSchemaValidation = z.object({
    userId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid User Id"
    }),
    postId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid Post Id"
    }),
    comment: z.string().trim(),
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
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true })


const Comments = model('Comment', CommentSchema);

export default Comments;