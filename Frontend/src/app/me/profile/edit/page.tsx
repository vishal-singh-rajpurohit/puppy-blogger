'use client'

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Save, Globe, Mail } from "lucide-react"
import { FaGithub, FaTwitter } from "react-icons/fa"
import { getAPICall, putAPICall } from "@/lib/api"
import { AuthSessionUnion } from "@/types/authSession.types"

type ProfileData = {
    name: string
    username: string
    email: string
    bio: string
    avatarUrl: string
    website: string
    github: string
    twitter: string
}

export default function EditProfilePage() {
    const { data: session, update } = useSession()
    const router = useRouter()

    const [form, setForm] = useState<ProfileData>({
        name: "",
        username: "",
        email: "",
        bio: "",
        avatarUrl: "",
        website: "",
        github: "",
        twitter: "",
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProfile() {
            if (!session) return
            try {
                const res = await getAPICall<any>("/auth/profile", session as typeof session & AuthSessionUnion)
                if (res && !Array.isArray(res) && res.body?.user) {
                    const u = res.body.user
                    setForm({
                        name: u.name || "",
                        username: u.username || "",
                        email: u.email || "",
                        bio: u.bio || "",
                        avatarUrl: u.avatarUrl || "",
                        website: u.website || "",
                        github: u.github || "",
                        twitter: u.twitter || "",
                    })
                }
            } catch (err) {
                console.error("Error loading profile:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [session])

    function updateField<K extends keyof ProfileData>(key: K, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setSuccessMessage(null)
        setSaving(true)

        try {
            const res = await putAPICall<any>(
                "/auth/profile",
                {
                    name: form.name,
                    username: form.username,
                    bio: form.bio,
                    avatarUrl: form.avatarUrl,
                    website: form.website,
                    github: form.github,
                    twitter: form.twitter,
                },
                session as typeof session & AuthSessionUnion
            )

            if (res && res.statusCode === 200) {
                if (update) {
                    await update({
                        name: form.name,
                        username: form.username,
                    })
                }
                setSuccessMessage("Profile updated successfully!")
                setTimeout(() => {
                    router.push("/me/profile")
                }, 1000)
            } else {
                setError(res?.message || "Failed to update profile.")
            }
        } catch {
            setError("Something went wrong while saving your profile.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-ui-bg-primary flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-ui-btn-bg-primary border-t-transparent rounded-full animate-spin" />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-ui-bg-primary">
            <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/me/profile"
                        className="inline-flex items-center gap-1.5 text-sm text-ui-text-secondary hover:text-ui-text-primary transition"
                    >
                        <ArrowLeft size={16} /> Back to profile
                    </Link>
                    <h1 className="text-xl font-semibold text-ui-text-primary">
                        Edit Profile
                    </h1>
                </div>

                <div className="rounded-sm bg-ui-card-primary p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <div className="rounded-sm bg-red-500/10 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="rounded-sm bg-green-500/10 p-3 text-sm text-green-700">
                                {successMessage}
                            </div>
                        )}

                        {/* Name and Username */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-ui-text-primary">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="Your full name"
                                    required
                                    className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-ui-text-primary">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => updateField("username", e.target.value)}
                                    placeholder="username"
                                    required
                                    className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                                />
                            </div>
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-ui-text-primary">
                                Email (Cannot be changed)
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                disabled
                                className="w-full rounded-sm bg-ui-bg-secondary/50 px-3.5 py-2.5 text-sm text-ui-text-secondary cursor-not-allowed outline-none"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-ui-text-primary">
                                Bio
                            </label>
                            <textarea
                                value={form.bio}
                                onChange={(e) => updateField("bio", e.target.value)}
                                rows={3}
                                placeholder="A few words about you, what you write about, or what you love..."
                                className="w-full resize-none rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                            />
                        </div>

                        {/* Avatar URL */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-ui-text-primary">
                                Avatar Image URL
                            </label>
                            <input
                                type="url"
                                value={form.avatarUrl}
                                onChange={(e) => updateField("avatarUrl", e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                            />
                            {form.avatarUrl && (
                                <div className="mt-2 flex items-center gap-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={form.avatarUrl}
                                        alt="Preview"
                                        className="size-10 rounded-full object-cover border border-gray-300"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                    <span className="text-xs text-ui-text-secondary">Avatar preview</span>
                                </div>
                            )}
                        </div>

                        {/* Links section */}
                        <div className="border-t border-gray-200/40 pt-4">
                            <h2 className="mb-3 text-sm font-semibold text-ui-text-primary">
                                Links & Socials
                            </h2>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1 text-xs font-medium text-ui-text-secondary">
                                        <Globe size={14} /> Website URL
                                    </div>
                                    <input
                                        type="url"
                                        value={form.website}
                                        onChange={(e) => updateField("website", e.target.value)}
                                        placeholder="https://yourwebsite.com"
                                        className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1 text-xs font-medium text-ui-text-secondary">
                                        <FaGithub size={14} /> GitHub Profile URL
                                    </div>
                                    <input
                                        type="url"
                                        value={form.github}
                                        onChange={(e) => updateField("github", e.target.value)}
                                        placeholder="https://github.com/username"
                                        className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1 text-xs font-medium text-ui-text-secondary">
                                        <FaTwitter size={14} /> Twitter / X Profile URL
                                    </div>
                                    <input
                                        type="url"
                                        value={form.twitter}
                                        onChange={(e) => updateField("twitter", e.target.value)}
                                        placeholder="https://x.com/username"
                                        className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-3">
                            <Link
                                href="/me/profile"
                                className="rounded-sm bg-ui-btn-bg-secondary px-4 py-2 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-secondary-hover"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-sm bg-ui-btn-bg-primary px-5 py-2 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover disabled:opacity-60"
                            >
                                <Save size={15} />
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}
