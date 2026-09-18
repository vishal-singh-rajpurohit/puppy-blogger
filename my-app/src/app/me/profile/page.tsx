'use client'
import Link from "next/link"
import { Mail, Globe, PenLine, Eye, Heart, type LucideIcon } from "lucide-react"

import { FaGithub, FaTwitter } from "react-icons/fa"
import { IconType } from "react-icons/lib"


type ProfileUser = {
  name: string
  username: string
  avatarUrl: string
  bio: string
  email?: string
  website?: string
  github?: string
  twitter?: string
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
}

// Replace with real data from your DB/API once wired up.
const mockUser: ProfileUser = {
  name: "Vishal Singh",
  username: "vishalsingh",
  avatarUrl:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
  bio: "Writing about code, coffee, and whatever else is on my mind this week.",
  email: "hello@vishalsingh.me",
  website: "https://vishalsingh.me",
  github: "https://github.com/vishalsingh",
  twitter: "https://twitter.com/vishalsingh",
}

// Swap to an empty array to see the "start writing" state.
const mockBlogs: Blog[] = [
  {
    id: "1",
    title: "What I learned rebuilding my blog with Next.js",
    excerpt:
      "Notes on App Router, theming with CSS variables, and the small decisions that took longer than expected.",
    slug: "rebuilding-my-blog-with-nextjs",
    publishedAt: "Sep 12, 2026",
    readTime: "4 min read",
    views: 1840,
    likes: 96,
  },
  {
    id: "2",
    title: "A simple theme system with Tailwind and data-attributes",
    excerpt:
      "How a single data-theme attribute and a handful of CSS variables replace a theme library.",
    slug: "simple-theme-system-tailwind",
    publishedAt: "Aug 28, 2026",
    readTime: "6 min read",
    views: 623,
    likes: 41,
  },
]

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

function ContactLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon | IconType
  label: string
}) {
  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      className="flex items-center gap-1.5 text-sm text-ui-text-secondary transition hover:text-ui-text-secondary-hover"
    >
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  )
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center sm:text-left">
      <span className="block text-base font-semibold text-ui-text-primary">
        {formatCount(value)}
      </span>
      <span className="block text-xs text-ui-text-secondary">{label}</span>
    </div>
  )
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="block rounded-sm bg-ui-card-secondary p-5 transition hover:bg-ui-card-tirtury"
    >
      <h3 className="text-base font-medium text-ui-text-primary">
        {blog.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ui-text-secondary">
        {blog.excerpt}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ui-text-secondary">
        <span>{blog.publishedAt} · {blog.readTime}</span>
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
      </div>
    </Link>
  )
}

function StartWritingCard() {
  return (
    <div className="rounded-sm border border-dashed border-ui-card-tirtury bg-ui-card-secondary p-10 text-center">
      <PenLine className="mx-auto text-ui-text-secondary" size={26} />
      <h3 className="mt-4 text-base font-medium text-ui-text-primary">
        No posts yet
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ui-text-secondary">
        Nothing published so far. Whatever you&apos;re thinking about,
        it&apos;s worth writing down.
      </p>
      <Link
        href="/me/write"
        className="mt-6 inline-block rounded-sm bg-ui-btn-bg-primary px-5 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover"
      >
        Start writing
      </Link>
    </div>
  )
}

export default function ProfilePage() {
  const user = mockUser
  const blogs = mockBlogs

  const totalViews = blogs.reduce((sum, blog) => sum + blog.views, 0)
  const totalLikes = blogs.reduce((sum, blog) => sum + blog.likes, 0)

  return (
    <main className="min-h-screen bg-ui-bg-primary">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-sm bg-ui-card-primary p-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            <img
              src={user.avatarUrl}
              alt={`${user.name}'s profile picture`}
              className="size-24 shrink-0 rounded-full border border-gray-300 object-cover shadow-inner"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h1 className="text-2xl font-semibold text-ui-text-primary">
                    {user.name}
                  </h1>
                  <p className="text-sm text-ui-text-secondary">
                    @{user.username}
                  </p>
                </div>

                <Link
                  href="/me/profile/edit"
                  className="shrink-0 rounded-sm bg-ui-btn-bg-secondary px-4 py-1.5 text-sm text-ui-btn-text-primary transition hover:bg-ui-btn-bg-secondary-hover"
                >
                  Edit profile
                </Link>
              </div>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-ui-text-secondary">
                {user.bio}
              </p>

              {blogs.length > 0 && (
                <div className="mt-5 flex items-center justify-center gap-6 sm:justify-start">
                  <ProfileStat label="Posts" value={blogs.length} />
                  <ProfileStat label="Views" value={totalViews} />
                  <ProfileStat label="Likes" value={totalLikes} />
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start">
                {user.email && (
                  <ContactLink
                    href={`mailto:${user.email}`}
                    icon={Mail}
                    label="Email"
                  />
                )}
                {user.website && (
                  <ContactLink
                    href={user.website}
                    icon={Globe}
                    label="Website"
                  />
                )}
                {user.github && (
                  <ContactLink
                    href={user.github}
                    icon={FaGithub}
                    label="GitHub"
                  />
                )}
                {user.twitter && (
                  <ContactLink
                    href={user.twitter}
                    icon={FaTwitter}
                    label="Twitter"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ui-text-primary">
              {blogs.length > 0 ? `Posts by ${user.name}` : "Posts"}
            </h2>
            {blogs.length > 0 && (
              <Link
                href="/me/write"
                className="text-sm text-ui-text-secondary transition hover:text-ui-text-secondary-hover"
              >
                Write a new post
              </Link>
            )}
          </div>

          {blogs.length > 0 ? (
            <div className="flex flex-col gap-4">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <StartWritingCard />
          )}
        </section>
      </div>
    </main>
  )
}
