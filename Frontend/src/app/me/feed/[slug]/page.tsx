"use client";

import { getAPICall, putAPICall } from "@/lib/api";
import { ApiResp, Blog } from "@/types/api.types";
import { AuthSessionUnion } from "@/types/authSession.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { use, useState } from "react";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { data: session } = useSession();
    const { slug } = use(params);
    const queryClient = useQueryClient();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Fetch Blog Post
    const { data, isPending, isError } = useQuery<ApiResp<Blog>>({
        queryKey: ['blog', slug],
        queryFn: async () => {
            const res = await getAPICall<ApiResp<Blog>>(`/blog/get/${slug}`, session as typeof session & AuthSessionUnion);
            if (Array.isArray(res)) {
                return { body: {} as Blog } as ApiResp<Blog>;
            }
            return res;
        },
        enabled: !!slug && !!session,

    });

    // Like Mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            return await putAPICall<any, {}>(`/blog/like/${data?.body.blog._id}`, {}, session as typeof session & AuthSessionUnion);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog', slug] });
        }
    });

    const handleCopyCode = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Scroll to comments section handler (customize ID if needed)
    const scrollToComments = () => {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (isPending) {
        return (
            <div className="min-h-screen bg-[var(--color-ui-bg-primary)] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-[var(--color-ui-btn-bg-primary)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-lg font-medium text-[var(--color-ui-text-secondary)] animate-pulse">
                        Loading article...
                    </p>
                </div>
            </div>
        );
    }

    if (isError || !data?.body?.blog) {
        return (
            <div className="min-h-screen bg-[var(--color-ui-bg-primary)] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-[var(--color-ui-card-primary)] p-8 rounded-2xl shadow-lg text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                        !
                    </div>
                    <h1 className="text-xl font-bold text-[var(--color-ui-text-primary)]">
                        Post not found or failed to load
                    </h1>
                    <p className="text-sm text-[var(--color-ui-text-secondary)]">
                        The article you are looking for might have been removed or is temporarily unavailable.
                    </p>
                </div>
            </div>
        );
    }

    const post = data.body.blog;

    return (
        <main className="min-h-screen bg-[var(--color-ui-bg-primary)] text-[var(--color-ui-text-primary)] py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <article className="max-w-3xl mx-auto space-y-10">

                {/* Header Meta Section */}
                <div className="space-y-6">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-ui-bg-secondary)] pb-6">
                        <div className="flex items-center space-x-4">
                            {post.author.avatarUrl ? (
                                <Image
                                    src={post.author.avatarUrl}
                                    alt={post.author.name}
                                    width={48}
                                    height={48}
                                    className="rounded-full ring-2 ring-[var(--color-ui-bg-secondary)] object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-[var(--color-ui-btn-bg-primary)] text-[var(--color-ui-btn-text-primary)] flex items-center justify-center font-bold text-lg shadow-sm">
                                    {post.author.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-base text-[var(--color-ui-text-primary)]">
                                    {post.author.name}
                                </p>
                                <p className="text-xs sm:text-sm text-[var(--color-ui-text-secondary)]">
                                    {new Date(post.updatedAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })} • {post.readTime || '3 min read'}
                                </p>
                            </div>
                        </div>

                        {/* Engagement Buttons Group (Like & Comment) */}
                        <div className="flex items-center space-x-3">
                            {/* Comment Button */}
                            <button
                                onClick={scrollToComments}
                                className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-[var(--color-ui-card-primary)] text-[var(--color-ui-text-primary)] hover:bg-[var(--color-ui-card-secondary)] shadow-sm hover:shadow active:scale-95 border border-[var(--color-ui-card-secondary)]"
                            >
                                <span className="transform group-hover:scale-110 transition-transform duration-200">💬</span>
                                <span className="font-bold">{post.commentsCount || 0}</span>
                            </button>

                            {/* Like Button */}
                            <button
                                onClick={() => likeMutation.mutate()}
                                disabled={likeMutation.isPending}
                                className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-[var(--color-ui-btn-bg-primary)] text-[var(--color-ui-btn-text-primary)] hover:bg-[var(--color-ui-btn-bg-primary-hover)] shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
                            >
                                <span className="transform group-hover:scale-125 transition-transform duration-200">❤️</span>
                                <span className="font-bold">{post.likesCount}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="relative w-full h-80 sm:h-[400px] rounded-2xl overflow-hidden shadow-xl border border-[var(--color-ui-bg-secondary)]">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transform hover:scale-105 transition-transform duration-500"
                            priority
                        />
                    </div>
                )}

                {/* Body Blocks Renderer */}
                <div className="space-y-6 text-[var(--color-ui-text-primary)] font-normal text-lg leading-relaxed">
                    {post.body?.map((block, index) => {
                        switch (block.type) {
                            case 'h1':
                                return (
                                    <h1 key={index} className="text-3xl sm:text-4xl font-bold tracking-tight mt-10 mb-4 text-[var(--color-ui-text-primary)]">
                                        {block.content}
                                    </h1>
                                );
                            case 'h2':
                                return (
                                    <h2 key={index} className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-3 text-[var(--color-ui-text-primary)]">
                                        {block.content}
                                    </h2>
                                );
                            case 'h3':
                                return (
                                    <h3 key={index} className="text-xl sm:text-2xl font-semibold mt-6 mb-2 text-[var(--color-ui-text-primary)]">
                                        {block.content}
                                    </h3>
                                );
                            case 'paragraph':
                                return (
                                    <p key={index} className="text-[var(--color-ui-text-secondary)] leading-relaxed mb-4">
                                        {block.content}
                                    </p>
                                );
                            case 'code':
                                return (
                                    <div key={index} className="my-6 rounded-xl overflow-hidden border border-[var(--color-ui-card-secondary)] bg-[var(--color-ui-card-primary)] shadow-md">
                                        {/* Terminal Top Bar */}
                                        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-ui-card-secondary)] border-b border-[var(--color-ui-card-tirtury)]">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                                <span className="ml-2 text-xs font-mono uppercase tracking-wider text-[var(--color-ui-text-secondary)]">
                                                    {block.lang || 'code'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleCopyCode(block.code, index)}
                                                className="text-xs font-mono px-2.5 py-1 rounded-md bg-[var(--color-ui-bg-primary)] text-[var(--color-ui-text-secondary)] hover:text-[var(--color-ui-text-primary)] transition-colors"
                                            >
                                                {copiedIndex === index ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto font-mono text-sm leading-normal">
                                            <pre className="text-[var(--color-ui-text-primary)]">
                                                <code>{block.code}</code>
                                            </pre>
                                        </div>
                                    </div>
                                );
                            case 'img':
                                return (
                                    <figure key={index} className="my-8">
                                        <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden shadow-lg border border-[var(--color-ui-bg-secondary)]">
                                            <Image
                                                src={block.src}
                                                alt={block.alt || 'Blog illustration image'}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        {block.alt && (
                                            <figcaption className="text-center text-sm text-[var(--color-ui-text-secondary)] mt-3 italic">
                                                {block.alt}
                                            </figcaption>
                                        )}
                                    </figure>
                                );
                            case 'list':
                                const ListTag = block.ordered ? 'ol' : 'ul';
                                return (
                                    <ListTag
                                        key={index}
                                        className={`space-y-2 my-6 pl-6 marker:text-[var(--color-ui-btn-bg-primary)] ${block.ordered ? 'list-decimal' : 'list-disc'
                                            }`}
                                    >
                                        {block.items.map((item, i) => (
                                            <li key={i} className="text-[var(--color-ui-text-secondary)] pl-1 leading-relaxed">
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

                {/* Optional Comments Section Anchor */}
                <div id="comments-section" className="pt-8 border-t border-[var(--color-ui-bg-secondary)] mt-12">
                    <h3 className="text-2xl font-bold mb-4">Comments ({post.commentsCount || 0})</h3>
                    <p className="text-[var(--color-ui-text-secondary)]">Comment component or list can be rendered here.</p>
                </div>

            </article>
        </main>
    );
}