'use client'
import { useState } from "react"
import Link from "next/link"
import { Eye, Heart, MessageCircle } from "lucide-react"

type Author = {
    name: string
    username: string
    avatarUrl: string
}

type Blog = {
    id: string
    title: string
    excerpt: string
    slug: string
    publishedAt: string
    readTime: string
    views: number
    likes: number
    comments: number
    author: Author
}

const AUTHORS: Author[] = [
    {
        name: "Vishal Singh",
        username: "vishalsingh",
        avatarUrl:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    },
    {
        name: "Maya Chen",
        username: "mayachen",
        avatarUrl:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    },
    {
        name: "Daniel Osei",
        username: "danielosei",
        avatarUrl:
            "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200",
    },
    {
        name: "Priya Nair",
        username: "priyanair",
        avatarUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    },
]

const POSTS: { title: string; excerpt: string }[] = [
    {
        title: "What I learned rebuilding my blog with Next.js",
        excerpt:
            "Notes on App Router, theming with CSS variables, and the small decisions that took longer than expected.",
    },
    {
        title: "A simple theme system with Tailwind and data-attributes",
        excerpt:
            "How a single data-theme attribute and a handful of CSS variables replace a theme library.",
    },
    {
        title: "Two weeks in Lisbon without a plan",
        excerpt:
            "What happens when you book a flight and figure out the rest once you land, told in six short stories.",
    },
    {
        title: "The bread recipe I've made every Sunday for a year",
        excerpt:
            "Flour, water, salt, and enough failed loaves to finally understand what the dough is telling you.",
    },
    {
        title: "Why I stopped using a to-do list app",
        excerpt:
            "A year of trying every productivity system led me back to a single sheet of paper on my desk.",
    },
    {
        title: "Notes from my first year as a freelance illustrator",
        excerpt:
            "Invoices, scope creep, and the client email that finally taught me to say no.",
    },
    {
        title: "How my grandmother's letters became a family archive",
        excerpt:
            "Scanning forty years of handwriting taught me more about her than any conversation did.",
    },
    {
        title: "Building a mechanical keyboard from spare parts",
        excerpt:
            "A weekend project that turned into three months, several soldering burns, and one very loud keyboard.",
    },
    {
        title: "What a 5am running habit actually changed",
        excerpt:
            "Not my body, mostly. A year of early mornings and what actually stuck.",
    },
    {
        title: "The used bookstore that shaped how I read",
        excerpt:
            "A tiny shop, a stubborn owner, and the reading list I never would have chosen myself.",
    },
    {
        title: "Learning to cook without recipes",
        excerpt:
            "Six months of improvising dinner and the handful of rules that actually held up.",
    },
    {
        title: "A short story: The last lighthouse keeper",
        excerpt:
            "Fiction. He'd kept the light for thirty years, and the automation crew was coming Tuesday.",
    },
    {
        title: "Everything I got wrong about remote work",
        excerpt:
            "Three years in, the advice that helped had almost nothing to do with productivity.",
    },
    {
        title: "Why I switched my garden to native plants",
        excerpt:
            "Less watering, more bees, and the neighbor who finally asked what I'd done differently.",
    },
]

function makeBlogs(): Blog[] {
    return POSTS.map((post, index) => {
        const author = AUTHORS[index % AUTHORS.length]
        return {
            id: String(index + 1),
            title: post.title,
            excerpt: post.excerpt,
            slug: post.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
            publishedAt: `Sep ${Math.max(1, 20 - index)}, 2026`,
            readTime: `${3 + (index % 5)} min read`,
            views: 180 + index * 137,
            likes: 8 + index * 9,
            comments: 1 + (index % 6),
            author,
        }
    })
}

// Replace with a real paginated API call once wired up.
const mockBlogs: Blog[] = makeBlogs()

const PAGE_SIZE = 10

// Compact number formatting: 1840 -> "1.8k"
function formatCount(value: number): string {
    if (value < 1000) return String(value)
    if (value < 1_000_000) {
        const thousands = value / 1000
        return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`
    }
    const millions = value / 1_000_000
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}m`
}

function FeedItem({ blog }: { blog: Blog }) {
    return (
        <Link
            href={`/blog/${blog.slug}`}
            className="block rounded-sm bg-ui-card-secondary p-5 transition hover:bg-ui-card-tirtury"
        >
            <div className="flex items-center gap-2.5">
                <img
                    src={blog.author.avatarUrl}
                    alt={`${blog.author.name}'s profile picture`}
                    className="size-8 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ui-text-primary">
                        {blog.author.name}
                    </p>
                    <p className="text-xs text-ui-text-secondary">
                        {blog.publishedAt} · {blog.readTime}
                    </p>
                </div>
            </div>

            <h3 className="mt-4 text-lg font-medium text-ui-text-primary">
                {blog.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ui-text-secondary">
                {blog.excerpt}
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs text-ui-text-secondary">
                <span className="flex items-center gap-1">
                    <Eye size={13} aria-hidden="true" />
                    {formatCount(blog.views)}
                    <span className="sr-only"> views</span>
                </span>
                <span className="flex items-center gap-1">
                    <Heart size={13} aria-hidden="true" />
                    {formatCount(blog.likes)}
                    <span className="sr-only"> likes</span>
                </span>
                <span className="flex items-center gap-1">
                    <MessageCircle size={13} aria-hidden="true" />
                    {formatCount(blog.comments)}
                    <span className="sr-only"> comments</span>
                </span>
            </div>
        </Link>
    )
}

export default function FeedPage() {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    const visibleBlogs = mockBlogs.slice(0, visibleCount)
    const hasMore = visibleCount < mockBlogs.length

    return (
        <main className="min-h-screen bg-ui-bg-primary">
            <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold text-ui-text-primary">Feed</h1>

                {visibleBlogs.length > 0 ? (
                    <div className="mt-8 flex flex-col gap-4">
                        {visibleBlogs.map((blog) => (
                            <FeedItem key={blog.id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <p className="mt-8 text-sm text-ui-text-secondary">
                        Nothing in the feed yet.
                    </p>
                )}

                {hasMore && (
                    <div className="mt-8 flex justify-center">
                        <button
                            type="button"
                            onClick={() =>
                                setVisibleCount((count) =>
                                    Math.min(count + PAGE_SIZE, mockBlogs.length)
                                )
                            }
                            className="rounded-sm bg-ui-btn-bg-secondary px-6 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-secondary-hover"
                        >
                            Show more
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
}
