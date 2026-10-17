"use client";

import { deleteAPICall, getAPICall, postAPICall, putAPICall } from "@/lib/api";
import { ApiResp } from "@/types/api.types";
import { AuthSessionUnion } from "@/types/authSession.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { use, useState, type FormEvent } from "react";
import { Heart, MessageCircle, Send, CornerDownRight, Check, Copy } from "lucide-react";

type CommentAuthor = {
    _id: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
};

type CommentItem = {
    _id: string;
    postId: string;
    comment: string;
    createdAt: string;
    userId?: CommentAuthor;
};

type SingleBlogPost = {
    _id: string;
    title: string;
    body: Array<
        | { type: "h1" | "h2" | "h3" | "paragraph"; content: string }
        | { type: "code"; lang: string; code: string }
        | { type: "img"; src: string; alt?: string }
        | { type: "list"; ordered?: boolean; items: string[] }
    >;
    coverImage?: string;
    updatedAt: string;
    readTime?: string;
    likesCount: number;
    commentsCount: number;
    viewsCount?: number;
    author: {
        _id: string;
        name: string;
        username: string;
        avatarUrl?: string;
    };
};

type BlogResponse = {
    blog: SingleBlogPost;
    isLiked?: boolean;
    isViewed?: boolean;
    success: boolean;
};

type CommentsResponse = {
    comments: CommentItem[];
    success: boolean;
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { data: session } = useSession();
    const { slug } = use(params);
    const queryClient = useQueryClient();

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [commentText, setCommentText] = useState("");
    const [commentError, setCommentError] = useState<string | null>(null);

    // Fetch Blog Post
    const { data, isPending, isError } = useQuery<ApiResp<BlogResponse>>({
        queryKey: ["blog", slug],
        queryFn: async () => {
            const res = await getAPICall<ApiResp<BlogResponse>>(
                `/blog/get/${slug}`,
                session as typeof session & AuthSessionUnion
            );
            if (Array.isArray(res) || !res || !res.body) {
                return { body: {} as BlogResponse } as ApiResp<BlogResponse>;
            }
            return res;
        },
        enabled: !!slug,
    });

    const post = data?.body?.blog;
    const isLiked = Boolean(data?.body?.isLiked);

    // Fetch Comments
    const { data: commentsData, isLoading: isCommentsLoading } = useQuery<ApiResp<CommentsResponse>>({
        queryKey: ["comments", post?._id],
        queryFn: async () => {
            if (!post?._id) return { body: { comments: [], success: true } } as ApiResp<CommentsResponse>;
            const res = await getAPICall<ApiResp<CommentsResponse>>(
                `/blog/comment/${post._id}/read`,
                session as typeof session & AuthSessionUnion
            );
            if (Array.isArray(res) || !res || !res.body) {
                return { body: { comments: [], success: true } } as ApiResp<CommentsResponse>;
            }
            return res;
        },
        enabled: !!post?._id,
    });

    // Like / Unlike Mutation
    const toggleLikeMutation = useMutation({
        mutationFn: async () => {
            if (!post?._id) return;
            if (isLiked) {
                return await putAPICall<any>(
                    `/blog/dislike/${post._id}`,
                    {},
                    session as typeof session & AuthSessionUnion
                );
            } else {
                return await putAPICall<any>(
                    `/blog/like/${post._id}`,
                    {},
                    session as typeof session & AuthSessionUnion
                );
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog", slug] });
        },
    });

    // Add Comment Mutation
    const addCommentMutation = useMutation({
        mutationFn: async (text: string) => {
            if (!post?._id) return;
            return await postAPICall<any>(
                `/blog/comment/${post._id}`,
                { comment: text },
                session as typeof session & AuthSessionUnion
            );
        },
        onSuccess: () => {
            setCommentText("");
            setCommentError(null);
            queryClient.invalidateQueries({ queryKey: ["comments", post?._id] });
            queryClient.invalidateQueries({ queryKey: ["blog", slug] });
        },
        onError: () => {
            setCommentError("Failed to add comment. Please try again.");
        },
    });

    const handleCopyCode = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const scrollToComments = () => {
        const commentsSection = document.getElementById("comments-section");
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleCommentSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        if (!session) {
            setCommentError("Please log in to leave a comment.");
            return;
        }
        addCommentMutation.mutate(commentText.trim());
    };

    if (isPending) {
        return (
            <div className="min-h-screen bg-ui-bg-primary flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-ui-btn-bg-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-lg font-medium text-ui-text-secondary animate-pulse">
                        Loading article...
                    </p>
                </div>
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="min-h-screen bg-ui-bg-primary flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-ui-card-primary p-8 rounded-2xl shadow-lg text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                        !
                    </div>
                    <h1 className="text-xl font-bold text-ui-text-primary">
                        Post not found or failed to load
                    </h1>
                    <p className="text-sm text-ui-text-secondary">
                        The article you are looking for might have been removed or is temporarily unavailable.
                    </p>
                    <Link
                        href="/me/feed"
                        className="inline-block rounded-sm bg-ui-btn-bg-primary px-4 py-2 text-sm text-ui-btn-text-primary hover:bg-ui-btn-bg-primary-hover transition"
                    >
                        Back to feed
                    </Link>
                </div>
            </div>
        );
    }

    const commentsList = commentsData?.body?.comments || [];

    return (
        <main className="min-h-screen bg-ui-bg-primary text-ui-text-primary py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <article className="max-w-3xl mx-auto space-y-10">
                {/* Header Meta Section */}
                <div className="space-y-6">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ui-bg-secondary pb-6">
                        <div className="flex items-center space-x-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.author.avatarUrl || "/icons/profile.png"}
                                alt={post.author.name}
                                className="w-12 h-12 rounded-full border border-gray-300 object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/icons/profile.png";
                                }}
                            />
                            <div>
                                <p className="font-semibold text-base text-ui-text-primary">
                                    {post.author.name}
                                </p>
                                <p className="text-xs sm:text-sm text-ui-text-secondary">
                                    {new Date(post.updatedAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}{" "}
                                    • {post.readTime || "3 min read"}
                                </p>
                            </div>
                        </div>

                        {/* Engagement Buttons Group (Like & Comment) */}
                        <div className="flex items-center space-x-3">
                            {/* Comment Button */}
                            <button
                                onClick={scrollToComments}
                                className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-ui-card-primary text-ui-text-primary hover:bg-ui-card-secondary shadow-sm hover:shadow active:scale-95 border border-ui-card-secondary"
                            >
                                <MessageCircle size={18} className="text-ui-text-secondary group-hover:text-ui-text-primary transition-colors" />
                                <span className="font-bold">{post.commentsCount || 0}</span>
                            </button>

                            {/* Like Button */}
                            <button
                                onClick={() => {
                                    if (!session) {
                                        window.location.href = "/auth";
                                        return;
                                    }
                                    toggleLikeMutation.mutate();
                                }}
                                disabled={toggleLikeMutation.isPending}
                                className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 ${
                                    isLiked
                                        ? "bg-red-500/10 text-red-600 border border-red-500/30"
                                        : "bg-ui-btn-bg-primary text-ui-btn-text-primary hover:bg-ui-btn-bg-primary-hover"
                                }`}
                                title={isLiked ? "Unlike post" : "Like post"}
                            >
                                <Heart
                                    size={18}
                                    className={`transition-transform duration-200 group-hover:scale-125 ${
                                        isLiked ? "fill-red-600 text-red-600" : ""
                                    }`}
                                />
                                <span className="font-bold">{post.likesCount || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="relative w-full h-80 sm:h-[400px] rounded-2xl overflow-hidden shadow-xl border border-ui-bg-secondary">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transform hover:scale-105 transition-transform duration-500"
                            priority
                            unoptimized
                        />
                    </div>
                )}

                {/* Body Blocks Renderer */}
                <div className="space-y-6 text-ui-text-primary font-normal text-lg leading-relaxed">
                    {post.body?.map((block, index) => {
                        switch (block.type) {
                            case "h1":
                                return (
                                    <h1 key={index} className="text-3xl sm:text-4xl font-bold tracking-tight mt-10 mb-4 text-ui-text-primary">
                                        {block.content}
                                    </h1>
                                );
                            case "h2":
                                return (
                                    <h2 key={index} className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-3 text-ui-text-primary">
                                        {block.content}
                                    </h2>
                                );
                            case "h3":
                                return (
                                    <h3 key={index} className="text-xl sm:text-2xl font-semibold mt-6 mb-2 text-ui-text-primary">
                                        {block.content}
                                    </h3>
                                );
                            case "paragraph":
                                return (
                                    <p key={index} className="text-ui-text-secondary leading-relaxed mb-4">
                                        {block.content}
                                    </p>
                                );
                            case "code":
                                return (
                                    <div key={index} className="my-6 rounded-xl overflow-hidden border border-ui-card-secondary bg-ui-card-primary shadow-md">
                                        {/* Terminal Top Bar */}
                                        <div className="flex items-center justify-between px-4 py-2.5 bg-ui-card-secondary border-b border-ui-card-tirtury">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                                <span className="ml-2 text-xs font-mono uppercase tracking-wider text-ui-text-secondary">
                                                    {block.lang || "code"}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleCopyCode(block.code, index)}
                                                className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-md bg-ui-bg-primary text-ui-text-secondary hover:text-ui-text-primary transition-colors"
                                            >
                                                {copiedIndex === index ? (
                                                    <>
                                                        <Check size={12} /> Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={12} /> Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto font-mono text-sm leading-normal">
                                            <pre className="text-ui-text-primary">
                                                <code>{block.code}</code>
                                            </pre>
                                        </div>
                                    </div>
                                );
                            case "img":
                                return (
                                    <figure key={index} className="my-8">
                                        <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden shadow-lg border border-ui-bg-secondary">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={block.src}
                                                alt={block.alt || "Blog illustration"}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {block.alt && (
                                            <figcaption className="text-center text-sm text-ui-text-secondary mt-3 italic">
                                                {block.alt}
                                            </figcaption>
                                        )}
                                    </figure>
                                );
                            case "list":
                                const ListTag = block.ordered ? "ol" : "ul";
                                return (
                                    <ListTag
                                        key={index}
                                        className={`space-y-2 my-6 pl-6 marker:text-ui-btn-bg-primary ${
                                            block.ordered ? "list-decimal" : "list-disc"
                                        }`}
                                    >
                                        {block.items.map((item, i) => (
                                            <li key={i} className="text-ui-text-secondary pl-1 leading-relaxed">
                                                {item}
                                            </li>
                                        ))}
                                    </ListTag>
                                );
                            default:
                                return null;
                        }
                    })}
                </div>

                {/* Comments Section */}
                <section id="comments-section" className="pt-10 border-t border-ui-bg-secondary mt-16 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-ui-text-primary">
                            Comments ({commentsList.length})
                        </h2>
                    </div>

                    {/* New Comment Box */}
                    <form onSubmit={handleCommentSubmit} className="rounded-xl bg-ui-card-primary p-5 shadow-sm space-y-3">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={session ? "Write a thoughtful comment..." : "Log in to leave a comment..."}
                            disabled={!session}
                            rows={3}
                            className="w-full resize-none rounded-lg bg-ui-bg-secondary p-3 text-sm text-ui-text-primary outline-none placeholder:text-ui-text-secondary disabled:cursor-not-allowed focus:ring-1 focus:ring-ui-btn-bg-primary"
                        />

                        {commentError && (
                            <p className="text-xs text-red-600">{commentError}</p>
                        )}

                        <div className="flex items-center justify-between">
                            {!session ? (
                                <Link
                                    href="/auth"
                                    className="text-xs text-ui-btn-bg-primary underline font-medium"
                                >
                                    Log in to comment
                                </Link>
                            ) : (
                                <span className="text-xs text-ui-text-secondary">
                                    Commenting as {session.user?.name || "Blogger"}
                                </span>
                            )}

                            <button
                                type="submit"
                                disabled={!session || !commentText.trim() || addCommentMutation.isPending}
                                className="inline-flex items-center gap-1.5 rounded-sm bg-ui-btn-bg-primary px-4 py-2 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover disabled:opacity-50"
                            >
                                <Send size={14} />
                                {addCommentMutation.isPending ? "Posting..." : "Post comment"}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    {isCommentsLoading ? (
                        <div className="space-y-4">
                            <div className="h-20 rounded-xl bg-ui-card-secondary/40 animate-pulse" />
                            <div className="h-20 rounded-xl bg-ui-card-secondary/40 animate-pulse" />
                        </div>
                    ) : commentsList.length > 0 ? (
                        <div className="space-y-4">
                            {commentsList.map((c) => (
                                <div
                                    key={c._id}
                                    className="rounded-xl bg-ui-card-secondary/50 p-4 space-y-2 border border-ui-card-secondary"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2.5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={c.userId?.avatarUrl || "/icons/profile.png"}
                                                alt={c.userId?.name || "Commenter"}
                                                className="w-7 h-7 rounded-full object-cover border border-gray-300"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/icons/profile.png";
                                                }}
                                            />
                                            <div>
                                                <span className="text-sm font-semibold text-ui-text-primary">
                                                    {c.userId?.name || "Blogger"}
                                                </span>
                                                {c.userId?.username && (
                                                    <span className="text-xs text-ui-text-secondary ml-1.5">
                                                        @{c.userId.username}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-ui-text-secondary">
                                            {new Date(c.createdAt).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-ui-text-primary leading-relaxed pl-9">
                                        {c.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl bg-ui-card-secondary/30 p-8 text-center space-y-1">
                            <MessageCircle className="mx-auto text-ui-text-secondary/60 mb-2" size={24} />
                            <p className="text-sm font-medium text-ui-text-primary">No comments yet</p>
                            <p className="text-xs text-ui-text-secondary">Be the first to share what you think!</p>
                        </div>
                    )}
                </section>
            </article>
        </main>
    );
}