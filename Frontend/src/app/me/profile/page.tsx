'use client'

import { useState } from "react"
import Link from "next/link"
import { Mail, Globe, PenLine, Eye, Heart, MessageCircle, LogOut, Settings, type LucideIcon } from "lucide-react"
import { FaGithub, FaTwitter } from "react-icons/fa"
import { IconType } from "react-icons/lib"
import { signOut, useSession } from "next-auth/react"
import { getAPICall } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { AuthSessionUnion } from "@/types/authSession.types"

type ProfileUser = {
  name?: string
  username?: string
  bio?: string
  email: string
  avatarUrl?: string
  website?: string
  github?: string
  twitter?: string
}

type UserPost = {
  _id: string
  title: string
  excerpt?: string
  slug?: string
  status: "draft" | "published"
  updatedAt: string
  views: number
  likesCount: number
  commentsCount: number
}

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
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
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
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all")

  // Fetch profile details
  const { data: profileResp, isLoading: isProfileLoading } = useQuery<{ body?: { user: ProfileUser } }>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await getAPICall<{ body?: { user: ProfileUser } }>('/auth/profile', session as typeof session & AuthSessionUnion)
      if (Array.isArray(res)) return { body: undefined }
      return res
    },
    enabled: !!session,
  })

  // Fetch user's own posts
  const { data: postsResp, isLoading: isPostsLoading } = useQuery<{ body?: { posts: UserPost[] } }>({
    queryKey: ['my-posts'],
    queryFn: async () => {
      const res = await getAPICall<{ body?: { posts: UserPost[] } }>('/auth/posts/get-my-posts', session as typeof session & AuthSessionUnion)
      if (Array.isArray(res)) return { body: { posts: [] } }
      return res
    },
    enabled: !!session,
  })

  const user: ProfileUser = profileResp?.body?.user || {
    name: session?.user?.name || "Blogger",
    username: (session?.user as any)?.username || "user",
    email: session?.user?.email || "",
  }

  const posts: UserPost[] = postsResp?.body?.posts || []

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "published") return post.status === "published"
    if (activeTab === "draft") return post.status === "draft"
    return true
  })

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0)
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" })
  }

  if (isProfileLoading && !profileResp) {
    return (
      <main className="min-h-screen bg-ui-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-ui-btn-bg-primary border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ui-bg-primary">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* User Card */}
        <section className="rounded-sm bg-ui-card-primary p-8 shadow-sm">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl || '/icons/profile.png'}
              alt={`${user.name || 'User'}'s profile picture`}
              className="size-24 shrink-0 rounded-full border border-gray-300 object-cover shadow-inner"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/icons/profile.png';
              }}
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h1 className="text-2xl font-semibold text-ui-text-primary">
                    {user.name || "Anonymous Writer"}
                  </h1>
                  <p className="text-sm text-ui-text-secondary">
                    @{user.username || "writer"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/me/profile/edit"
                    className="inline-flex items-center gap-1.5 shrink-0 rounded-sm bg-ui-btn-bg-secondary px-3.5 py-1.5 text-sm text-ui-btn-text-primary transition hover:bg-ui-btn-bg-secondary-hover"
                  >
                    <Settings size={14} />
                    Edit profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 shrink-0 rounded-sm bg-ui-bg-secondary px-3.5 py-1.5 text-sm text-ui-text-primary transition hover:bg-red-500/10 hover:text-red-600"
                    title="Log out"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>

              {user.bio ? (
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ui-text-secondary">
                  {user.bio}
                </p>
              ) : (
                <p className="mt-3 max-w-md text-sm italic text-ui-text-secondary/70">
                  No bio yet. Click &ldquo;Edit profile&rdquo; to add a bio.
                </p>
              )}

              <div className="mt-5 flex items-center justify-center gap-6 sm:justify-start">
                <ProfileStat label="Posts" value={posts.length} />
                <ProfileStat label="Views" value={totalViews} />
                <ProfileStat label="Likes" value={totalLikes} />
              </div>

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

        {/* Posts Section */}
        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-ui-text-primary">
                Posts ({posts.length})
              </h2>

              {posts.length > 0 && (
                <div className="flex rounded-sm bg-ui-bg-secondary p-1 text-xs">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`rounded-sm px-2.5 py-1 transition ${
                      activeTab === "all"
                        ? "bg-ui-btn-bg-primary text-ui-btn-text-primary font-medium"
                        : "text-ui-text-secondary hover:text-ui-text-primary"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("published")}
                    className={`rounded-sm px-2.5 py-1 transition ${
                      activeTab === "published"
                        ? "bg-ui-btn-bg-primary text-ui-btn-text-primary font-medium"
                        : "text-ui-text-secondary hover:text-ui-text-primary"
                    }`}
                  >
                    Published
                  </button>
                  <button
                    onClick={() => setActiveTab("draft")}
                    className={`rounded-sm px-2.5 py-1 transition ${
                      activeTab === "draft"
                        ? "bg-ui-btn-bg-primary text-ui-btn-text-primary font-medium"
                        : "text-ui-text-secondary hover:text-ui-text-primary"
                    }`}
                  >
                    Drafts
                  </button>
                </div>
              )}
            </div>

            <Link
              href="/me/write"
              className="inline-flex items-center gap-1.5 rounded-sm bg-ui-btn-bg-primary px-3.5 py-1.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover"
            >
              <PenLine size={14} /> Write a new post
            </Link>
          </div>

          {isPostsLoading ? (
            <div className="flex flex-col gap-4">
              <div className="h-28 rounded-sm bg-ui-card-secondary/50 animate-pulse" />
              <div className="h-28 rounded-sm bg-ui-card-secondary/50 animate-pulse" />
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredPosts.map((blog) => {
                const targetHref = blog.status === "published" && blog.slug
                  ? `/me/feed/${blog.slug}`
                  : `/me/write?id=${blog._id}`

                return (
                  <Link
                    key={blog._id}
                    href={targetHref}
                    className="group block rounded-sm bg-ui-card-secondary p-5 transition hover:bg-ui-card-tirtury"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-medium text-ui-text-primary group-hover:underline">
                        {blog.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-sm font-medium shrink-0 ${
                          blog.status === "published"
                            ? "bg-green-600/10 text-green-700"
                            : "bg-yellow-600/15 text-yellow-800"
                        }`}
                      >
                        {blog.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>

                    {blog.excerpt && (
                      <p className="mt-1.5 text-sm leading-relaxed text-ui-text-secondary line-clamp-2">
                        {blog.excerpt}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ui-text-secondary">
                      <span>
                        {new Date(blog.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={13} aria-hidden="true" />
                        {formatCount(blog.views || 0)}
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
              })}
            </div>
          ) : (
            <StartWritingCard />
          )}
        </section>
      </div>
    </main>
  )
}
