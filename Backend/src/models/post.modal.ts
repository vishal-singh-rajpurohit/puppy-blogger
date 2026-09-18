import mongoose, { Schema, Model, Document, Types } from "mongoose"

export type BlogStatus = "draft" | "published"

export interface IPost extends Document {
    title: string
    slug: string
    author: Types.ObjectId
    body: Record<string, unknown>[]
    excerpt?: string
    coverImage?: string
    status: BlogStatus
    publishedAt?: Date
    readTime?: string
    views: number
    likes: Types.ObjectId[]
    commentsCount: number
    createdAt: Date
    updatedAt: Date
    likesCount: number // virtual
}

const discriminatorOptions = { discriminatorKey: "type", _id: false } as const

const blockBaseSchema = new Schema({}, discriminatorOptions)

const blogSchema = new Schema<IPost>(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        body: { type: [blockBaseSchema], default: [] },
        excerpt: { type: String, trim: true, maxlength: 300 },
        coverImage: { type: String, trim: true },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
            index: true,
        },
        publishedAt: { type: Date },
        readTime: { type: String },
        views: { type: Number, default: 0, min: 0 },
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        commentsCount: { type: Number, default: 0, min: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)


const bodyPath = blogSchema.path("body") as mongoose.Schema.Types.DocumentArray

bodyPath.discriminator(
    "h1",
    new Schema({ content: { type: String, required: true } }, { _id: false })
)
bodyPath.discriminator(
    "h2",
    new Schema({ content: { type: String, required: true } }, { _id: false })
)
bodyPath.discriminator(
    "h3",
    new Schema({ content: { type: String, required: true } }, { _id: false })
)
bodyPath.discriminator(
    "paragraph",
    new Schema({ content: { type: String, required: true } }, { _id: false })
)
bodyPath.discriminator(
    "code",
    new Schema(
        {
            lang: { type: String, required: true },
            code: { type: String, required: true },
        },
        { _id: false }
    )
)
bodyPath.discriminator(
    "img",
    new Schema(
        {
            src: { type: String, required: true },
            alt: { type: String, default: "" },
        },
        { _id: false }
    )
)

bodyPath.discriminator(
    "list",
    new Schema(
        {
            ordered: { type: Boolean, default: false },
            items: { type: [String], required: true },
        },
        { _id: false }
    )
)

blogSchema.virtual("likesCount").get(function (this: IPost) {
    return this.likes?.length ?? 0
})


blogSchema.pre("save", function () {
    const doc = this as unknown as IPost
    const blocks = doc.body as Array<Record<string, unknown>>

    if (!doc.excerpt) {
        const firstParagraph = blocks.find(
            (block) =>
                block.type === "paragraph" &&
                typeof block.content === "string"
        )

        if (firstParagraph) {
            doc.excerpt = String(firstParagraph.content).slice(0, 200)
        }
    }

    if (!doc.coverImage) {
        const firstImage = blocks.find(
            (block) => block.type === "img" && block.src
        )

        if (firstImage) {
            doc.coverImage = String(firstImage.src)
        }
    }

    if (!doc.readTime) {
        const wordCount = blocks.reduce((total, block) => {
            if (block.type === "code") return total

            if (block.type === "list" && Array.isArray(block.items)) {
                return (
                    total +
                    (block.items as string[])
                        .join(" ")
                        .split(/\s+/)
                        .filter(Boolean).length
                )
            }

            if (typeof block.content === "string") {
                return (
                    total +
                    block.content.split(/\s+/).filter(Boolean).length
                )
            }

            return total
        }, 0)

        const minutes = Math.max(1, Math.ceil(wordCount / 200))
        doc.readTime = `${minutes} min read`
    }

    if (doc.status === "published" && !doc.publishedAt) {
        doc.publishedAt = new Date()
    }
})

blogSchema.index({ status: 1, publishedAt: -1 })
blogSchema.index({ author: 1, publishedAt: -1 })
blogSchema.index({ title: "text", excerpt: "text" })

const Blog: Model<IPost> =
    (mongoose.models.Blog as Model<IPost>) || mongoose.model<IPost>("Blog", blogSchema)

export default Blog