import mongoose, { model, Schema, Types } from "mongoose"
import { z } from "zod"


const LikesSchemaValidation = z.object({
    userId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid User Id"
    }),
    postId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid Post Id"
    }),
    isLike: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
});

type ILike = z.infer<typeof LikesSchemaValidation>;

const LikeSchema = new Schema<Omit<ILike, 'userId' | 'postId'> & {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
}>({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isLike: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true })


const Like = model('Like', LikeSchema);

export default Like;