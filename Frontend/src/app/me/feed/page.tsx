'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, Heart, MessageCircle, PenLine, Sparkles } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getAPICall } from "@/lib/api"
import { feedLimit } from "@/config"
import { useSession } from "next-auth/react"
import { AuthSessionUnion } from "@/types/authSession.types"
import { ApiResp, BlogFeedOverview, BlogsFeed } from "@/types/api.types"

function formatCount(value: number): string {
    if (value < 1000) return String(value)
    if (value < 1_000_000) {
        const thousands = value / 1000
        return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`
    }
    const millions = value / 1_000_000
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}m`
}

function FeedItem({ blog }: { blog: BlogFeedOverview }) {
    return (
        <Link
            href={`/me/feed/${blog.slug}`}
            className="block rounded-sm bg-ui-card-secondary p-5 transition hover:bg-ui-card-tirtury"
        >
            <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={blog.author?.avatarUrl || "/icons/profile.png"}
                    alt={`${blog.author?.username || 'Author'}'s profile picture`}
                    className="size-8 shrink-0 rounded-full object-cover border border-gray-300"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/profile.png';
                    }}
                />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ui-text-primary">
                        {blog.author?.name || "Blogger"}
                    </p>
                    <p className="text-xs text-ui-text-secondary">
                        {new Date(blog.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        })} · {blog.readTime || "3 min read"}
                    </p>
                </div>
            </div>

            <h3 className="mt-4 text-lg font-medium text-ui-text-primary">
                {blog.title}
            </h3>
            {blog.excerpt && (
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ui-text-secondary">
                    {blog.excerpt}
                </p>
            )}

            <div className="mt-4 flex items-center gap-4 text-xs text-ui-text-secondary">
                <span className="flex items-center gap-1">
                    <Eye size={13} aria-hidden="true" />
                    {formatCount(blog.viewsCount || 0)}
                    <span className="sr-only"> views</span>
                </span>
                <span className="flex items-center gap-1">
                    <Heart size={13} aria-hidden="true" />
                    {formatCount(blog.likesCount || 0)}
                    <span className="sr-only"> likes</span>
                </span>
                <span className="flex items-center gap-1">
                    <MessageCircle size={13} aria-hidden="true" />
                    {formatCount(blog.commentsCount || 0)}
                    <span className="sr-only"> comments</span>
                </span>
            </div>
        </Link>
    )
}

function FeedItemLoading() {
    return (
        <section className="mt-8 flex flex-col gap-4">
            <div className="block rounded-sm bg-ui-card-secondary/60 p-5 h-36 animate-pulse" />
            <div className="block rounded-sm bg-ui-card-secondary/60 p-5 h-36 animate-pulse" />
        </section>
    )
}

export default function FeedPage() {
    const { data: session } = useSession()
    const [page, setPage] = useState<number>(0)
    const [accumulatedBlogs, setAccumulatedBlogs] = useState<BlogFeedOverview[]>([])
    const [hasMore, setHasMore] = useState<boolean>(true)

    const limit = feedLimit || 10

    const { data, isPending, isFetching } = useQuery<ApiResp<BlogsFeed>>({
        queryKey: ['blogs', page],
        queryFn: async () => {
            const res = await getAPICall<ApiResp<BlogsFeed>>(
                `/blog/feed/${page}/${limit}`,
                session as typeof session & AuthSessionUnion
            )

            if (Array.isArray(res) || !res || !res.body) {
                return { body: { blog: [], success: true } } as ApiResp<BlogsFeed>
            }

            return res
        },
    })

    useEffect(() => {
        if (data?.body?.blog) {
            const newBlogs = data.body.blog
            if (page === 0) {
                setAccumulatedBlogs(newBlogs)
            } else {
                setAccumulatedBlogs((prev) => {
                    const existingIds = new Set(prev.map((b) => b._id))
                    const filtered = newBlogs.filter((b) => !existingIds.has(b._id))
                    return [...prev, ...filtered]
                })
            }
            if (newBlogs.length < limit) {
                setHasMore(false)
            } else {
                setHasMore(true)
            }
        }
    }, [data, page, limit])

    return (
        <main className="min-h-screen bg-ui-bg-primary">
            <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-ui-text-primary">Feed</h1>
                        <p className="mt-1 text-sm text-ui-text-secondary">
                            Discover stories, thinking, and ideas from the community.
                        </p>
                    </div>
                    <Link
                        href="/me/write"
                        className="inline-flex items-center gap-1.5 rounded-sm bg-ui-btn-bg-primary px-3.5 py-1.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover"
                    >
                        <PenLine size={14} /> Write
                    </Link>
                </div>

                {isPending && page === 0 && <FeedItemLoading />}

                {accumulatedBlogs.length > 0 && (
                    <div className="mt-8 flex flex-col gap-4">
                        {accumulatedBlogs.map((blog) => (
                            <FeedItem key={blog._id} blog={blog} />
                        ))}
                    </div>
                )}

                {!isPending && accumulatedBlogs.length === 0 && (
                    <div className="mt-8 rounded-sm border border-dashed border-ui-card-tirtury bg-ui-card-secondary p-12 text-center">
                        <Sparkles className="mx-auto text-ui-text-secondary" size={30} />
                        <h2 className="mt-4 text-lg font-medium text-ui-text-primary">
                            No published posts yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ui-text-secondary">
                            Be the first to share your thoughts, tutorial, or story with everyone!
                        </p>
                        <Link
                            href="/me/write"
                            className="mt-6 inline-block rounded-sm bg-ui-btn-bg-primary px-5 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover"
                        >
                            Publish your first post
                        </Link>
                    </div>
                )}

                {hasMore && accumulatedBlogs.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={isFetching}
                            className="rounded-sm bg-ui-btn-bg-secondary px-6 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-secondary-hover disabled:opacity-60"
                        >
                            {isFetching ? "Loading more..." : "Show more"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
}
