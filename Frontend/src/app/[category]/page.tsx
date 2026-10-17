import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PenLine, ArrowLeft, BookOpen, Clock, Heart, MessageCircle } from "lucide-react";
import { getAPICall } from "@/lib/api";
import { ApiResp } from "@/types/api.types";

type CategoryInfo = {
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
};

const CATEGORY_MAP: Record<string, CategoryInfo> = {
    lifestyle: {
        title: "Lifestyle & Journal",
        subtitle: "Everyday stories, routines, and personal reflections",
        description:
            "Explore intimate personal reflections, mindful routines, wellness experiences, and essays documenting the beauty of daily living.",
        tags: ["Daily Life", "Habits", "Mindfulness", "Productivity", "Reflections"],
    },
    technology: {
        title: "Technology & How-To",
        subtitle: "Guides, tutorials, and hard-earned technical lessons",
        description:
            "Clear explanations, developer notes, architecture breakdowns, and approachable guides to navigating modern technology.",
        tags: ["Software Engineering", "Web Development", "AI & Tools", "Tutorials", "Architecture"],
    },
    travel: {
        title: "Travel & Food",
        subtitle: "Trip notes, local guides, recipes, and culinary adventures",
        description:
            "Immerse yourself in travel chronicles, hidden neighborhood gems, coffee culture, and flavorful recipes shared by food lovers.",
        tags: ["Wanderlust", "City Guides", "Cuisine", "Recipes", "Solo Travel"],
    },
    "creative-writing": {
        title: "Creative Writing",
        subtitle: "Poetry, short fiction, essays, and imaginative prose",
        description:
            "A sanctuary for wordsmiths. Discover evocative poetry, fictional vignettes, poignant essays, and creative storytelling.",
        tags: ["Short Fiction", "Poetry", "Personal Essays", "Flash Fiction", "Storytelling"],
    },
};

type Post = {
    _id: string;
    title: string;
    slug: string;
    readTime?: string;
    createdAt: string;
    excerpt?: string;
    coverImage?: string;
    likesCount?: number;
    commentsCount?: number;
    author?: {
        name?: string;
        username?: string;
        avatarUrl?: string;
    };
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ category: string }>;
}): Promise<Metadata> {
    const { category } = await params;
    const cat = CATEGORY_MAP[category.toLowerCase()];
    if (!cat) {
        return {
            title: "Category Not Found — Puppy Blogger",
        };
    }
    return {
        title: `${cat.title} — Puppy Blogger`,
        description: cat.description,
    };
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    const cat = CATEGORY_MAP[category.toLowerCase()];

    if (!cat) {
        notFound();
    }

    let posts: Post[] = [];
    try {
        const res = await getAPICall<ApiResp<{ blogs: Post[] }>>("/blog/feed/0/10");
        if (res && !Array.isArray(res) && res.body?.blogs) {
            posts = res.body.blogs;
        }
    } catch {
        posts = [];
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Breadcrumb / Back */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ui-text-secondary hover:text-ui-text-primary transition"
                >
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <Link
                    href="/me/write"
                    className="inline-flex items-center gap-1.5 rounded-sm bg-ui-btn-bg-primary px-3.5 py-1.5 text-xs font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover shadow-sm"
                >
                    <PenLine size={13} /> Write a Story
                </Link>
            </div>

            {/* Header Hero */}
            <header className="rounded-2xl border border-gray-200/60 bg-ui-card-primary p-8 sm:p-10 shadow-sm">
                <span className="inline-block rounded-full bg-ui-bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#B0503B]">
                    Category
                </span>
                <h1 className="mt-3 text-3xl sm:text-4xl font-serif text-ui-text-primary">
                    {cat.title}
                </h1>
                <p className="mt-2 text-lg text-ui-text-secondary">
                    {cat.subtitle}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ui-text-secondary/90">
                    {cat.description}
                </p>

                {/* Topic tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {cat.tags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full border border-gray-200/80 bg-ui-bg-primary px-3 py-1 text-xs text-ui-text-secondary"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </header>

            {/* Stories Section */}
            <section className="mt-12">
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
                    <div className="flex items-center gap-2">
                        <BookOpen size={20} className="text-[#B0503B]" />
                        <h2 className="text-xl font-serif text-ui-text-primary">
                            Community Stories
                        </h2>
                    </div>
                    <Link
                        href="/me/feed"
                        className="text-xs font-medium text-[#3F5B33] hover:underline"
                    >
                        View Full Feed &rarr;
                    </Link>
                </div>

                {posts.length === 0 ? (
                    <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-ui-card-primary p-12 text-center">
                        <BookOpen size={40} className="mx-auto text-ui-text-secondary/50" />
                        <h3 className="mt-4 text-base font-semibold text-ui-text-primary">
                            No stories published yet
                        </h3>
                        <p className="mt-2 text-sm text-ui-text-secondary">
                            Be the first to share an article in {cat.title}!
                        </p>
                        <Link
                            href="/me/write"
                            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ui-btn-bg-primary px-5 py-2 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover"
                        >
                            <PenLine size={14} /> Start Writing
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {posts.map((post) => (
                            <Link
                                key={post._id}
                                href={`/me/feed/${post.slug}`}
                                className="group flex flex-col justify-between rounded-xl border border-gray-200/60 bg-ui-card-primary p-6 transition hover:border-gray-300 hover:shadow-md"
                            >
                                <div>
                                    {post.coverImage && (
                                        <div className="relative mb-4 h-44 w-full overflow-hidden rounded-lg bg-ui-bg-secondary">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    )}

                                    <h3 className="text-xl font-serif text-ui-text-primary group-hover:text-[#B0503B] transition">
                                        {post.title}
                                    </h3>

                                    {post.excerpt && (
                                        <p className="mt-2 line-clamp-3 text-sm text-ui-text-secondary">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-ui-text-secondary">
                                    <div className="flex items-center gap-2">
                                        {post.author?.name && (
                                            <span className="font-medium text-ui-text-primary">
                                                {post.author.name}
                                            </span>
                                        )}
                                        {post.readTime && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {post.readTime}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Heart size={12} /> {post.likesCount ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle size={12} /> {post.commentsCount ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
