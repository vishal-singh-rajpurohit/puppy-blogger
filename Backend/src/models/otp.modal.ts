import { z } from 'zod'
import mongoose, { model, Schema, Types } from 'mongoose'


const OTPValildator = z.object({
    otp: z.string().length(6),
    userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid UserId"
    }),
    expired: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
})

type IOTP = z.infer<typeof OTPValildator>;


const OTPSchema = new Schema<Omit<IOTP, 'userId'> & { userId: mongoose.Types.ObjectId }>({
    otp: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expired: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true });


const OTPs = model<Omit<IOTP, 'userId'> & { userId: mongoose.Types.ObjectId }>('OTP', OTPSchema);

export default OTPs;