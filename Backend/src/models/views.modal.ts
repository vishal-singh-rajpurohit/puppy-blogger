import { boolean, z } from "zod"
import mongoose, { Schema, model } from "mongoose"


const ViewsSchemaValidator = z.object({
    userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Give a Valid UserId' }),
    postId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Give a Valid UserId' }),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

type IViews = z.infer<typeof ViewsSchemaValidator>;


const ViewsSchema = new Schema<Omit<IViews, 'userId' | 'postId'> & {
    userId?: mongoose.Types.ObjectId,
    postId: mongoose.Types.ObjectId,
}>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    }
}, { timestamps: true });


const Views = model<Omit<IViews, 'userId' | 'postId'> & {
    userId?: mongoose.Types.ObjectId,
    postId: mongoose.Types.ObjectId,
}>('View', ViewsSchema);


export default Views