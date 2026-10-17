"use client"
import { Menu, Palette, PenLine, User as UserIcon, LogOut, Settings, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useSession, signOut } from "next-auth/react"

type Theme = "dark" | "nature" | "default"

const THEMES: { value: Theme; label: string }[] = [
    { value: 'default', label: "Default" },
    { value: "dark", label: "Dark" },
    { value: "nature", label: "Forest" },
]

function ThemesCard({
    setOpenTheme,
    setTheme,
    theme,
}: {
    setTheme: (val: Theme) => void
    setOpenTheme: (val: boolean) => void
    theme: Theme
}) {
    return (
        <ul
            role="listbox"
            className="absolute right-0 mt-2 w-32 overflow-hidden rounded-sm border border-gray-200 bg-ui-card-primary shadow-lg z-50"
        >
            {THEMES.map((option) => (
                <li key={option.value}>
                    <button
                        type="button"
                        role="option"
                        aria-selected={theme === option.value}
                        className={`block w-full px-3 py-2 text-left text-sm transition text-ui-text-primary hover:bg-ui-card-secondary ${
                            theme === option.value ? "font-bold bg-ui-card-secondary/70" : ""
                        }`}
                        onClick={() => {
                            setTheme(option.value)
                            setOpenTheme(false)
                        }}
                    >
                        {option.label}
                    </button>
                </li>
            ))}
        </ul>
    )
}

const Header = () => {
    const { data: session } = useSession()
    const [openHeader, setHeader] = useState<boolean>(false)
    const [openProfile, setOpenProfile] = useState<boolean>(false)
    const [openTheme, setOpenTheme] = useState<boolean>(false)
    const [theme, setTheme] = useState<Theme>("default")
    const profileRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (theme === "default") {
            document.documentElement.removeAttribute("data-theme")
        } else {
            document.documentElement.setAttribute("data-theme", theme)
        }
    }, [theme])

    // Close profile dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setOpenProfile(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleLogout = async () => {
        setOpenProfile(false)
        await signOut({ callbackUrl: "/auth" })
    }

    return (
        <header className="sticky top-0 z-40 bg-ui-bg-primary/95 backdrop-blur-sm border-b border-gray-200/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link className="flex items-center gap-2.5" href="/">
                            <Image src="/icons/logo.png" alt="logo" width={38} height={38} className="object-contain" />
                            <span className="font-semibold text-lg text-ui-text-primary hidden sm:inline">
                                Puppy Blogger
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <nav aria-label="Global" className="hidden md:block">
                            <ul className="flex items-center gap-6 text-sm">
                                <li>
                                    <Link className="text-ui-text-secondary hover:text-ui-text-primary transition" href="/me/feed">
                                        Feed
                                    </Link>
                                </li>

                                <li>
                                    <Link className="text-ui-text-secondary hover:text-ui-text-primary transition" href="/about">
                                        About
                                    </Link>
                                </li>

                                {session && (
                                    <li>
                                        <Link
                                            className="inline-flex items-center gap-1.5 rounded-sm bg-ui-btn-bg-primary px-3 py-1.5 text-xs font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover"
                                            href="/me/write"
                                        >
                                            <PenLine size={13} /> Write
                                        </Link>
                                    </li>
                                )}

                                <li className="relative">
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 rounded-sm border border-gray-300 px-2.5 py-1.5 text-ui-text-secondary transition hover:bg-ui-card-secondary"
                                        onClick={() => setOpenTheme((open) => !open)}
                                        aria-expanded={openTheme}
                                        aria-haspopup="listbox"
                                        title="Change theme"
                                    >
                                        <Palette size={16} />
                                        <span className="sr-only">Change theme</span>
                                    </button>

                                    {openTheme && (
                                        <ThemesCard setOpenTheme={setOpenTheme} setTheme={setTheme} theme={theme} />
                                    )}
                                </li>
                            </ul>
                        </nav>

                        {/* Profile Dropdown / Sign in button */}
                        <div className="hidden md:relative md:block" ref={profileRef}>
                            {session ? (
                                <>
                                    <button
                                        type="button"
                                        className="overflow-hidden cursor-pointer rounded-full border border-gray-300 shadow-inner flex items-center justify-center transition hover:ring-2 hover:ring-ui-btn-bg-primary"
                                        onClick={() => setOpenProfile((open) => !open)}
                                        aria-expanded={openProfile}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/icons/profile.png"
                                            alt={session.user?.name || "Profile"}
                                            className="size-9 object-cover"
                                        />
                                    </button>

                                    {openProfile && (
                                        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-sm border border-gray-200 bg-ui-card-primary shadow-lg z-50">
                                            <div className="border-b border-gray-200/60 p-3">
                                                <p className="truncate text-sm font-semibold text-ui-text-primary">
                                                    {session.user?.name || "Blogger"}
                                                </p>
                                                <p className="truncate text-xs text-ui-text-secondary">
                                                    {(session.user as any)?.username ? `@${(session.user as any).username}` : session.user?.email}
                                                </p>
                                            </div>

                                            <div className="p-1">
                                                <Link
                                                    href="/me/profile"
                                                    onClick={() => setOpenProfile(false)}
                                                    className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-ui-text-primary hover:bg-ui-card-secondary transition"
                                                >
                                                    <UserIcon size={14} /> My Profile
                                                </Link>

                                                <Link
                                                    href="/me/write"
                                                    onClick={() => setOpenProfile(false)}
                                                    className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-ui-text-primary hover:bg-ui-card-secondary transition"
                                                >
                                                    <PenLine size={14} /> Write Post
                                                </Link>

                                                <Link
                                                    href="/me/profile/edit"
                                                    onClick={() => setOpenProfile(false)}
                                                    className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-ui-text-primary hover:bg-ui-card-secondary transition"
                                                >
                                                    <Settings size={14} /> Edit Profile
                                                </Link>

                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 transition"
                                                >
                                                    <LogOut size={14} /> Log out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="rounded-sm bg-ui-btn-bg-primary px-4 py-2 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover"
                                >
                                    Log in
                                </Link>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="block md:hidden">
                            <button
                                type="button"
                                className="rounded-sm bg-ui-bg-secondary p-2 text-ui-text-primary transition hover:bg-ui-card-secondary"
                                onClick={() => setHeader((open) => !open)}
                                aria-expanded={openHeader}
                            >
                                <span className="sr-only">Toggle menu</span>
                                {openHeader ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile navigation */}
                <nav
                    aria-label="Mobile navigation"
                    className={`${openHeader ? "block" : "hidden"} border-t border-gray-200/50 py-4 md:hidden`}
                >
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link
                                className="block rounded-lg px-3 py-2 text-ui-text-primary hover:bg-ui-bg-secondary transition"
                                href="/me/feed"
                                onClick={() => setHeader(false)}
                            >
                                Feed
                            </Link>
                        </li>
                        <li>
                            <Link
                                className="block rounded-lg px-3 py-2 text-ui-text-primary hover:bg-ui-bg-secondary transition"
                                href="/about"
                                onClick={() => setHeader(false)}
                            >
                                About
                            </Link>
                        </li>

                        {session ? (
                            <>
                                <li>
                                    <Link
                                        className="block rounded-lg px-3 py-2 text-ui-text-primary hover:bg-ui-bg-secondary transition"
                                        href="/me/write"
                                        onClick={() => setHeader(false)}
                                    >
                                        Write a post
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="block rounded-lg px-3 py-2 text-ui-text-primary hover:bg-ui-bg-secondary transition"
                                        href="/me/profile"
                                        onClick={() => setHeader(false)}
                                    >
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="block rounded-lg px-3 py-2 text-ui-text-primary hover:bg-ui-bg-secondary transition"
                                        href="/me/profile/edit"
                                        onClick={() => setHeader(false)}
                                    >
                                        Edit profile
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            setHeader(false)
                                            handleLogout()
                                        }}
                                        className="block w-full text-left rounded-lg px-3 py-2 text-red-600 hover:bg-red-500/10 transition"
                                    >
                                        Log out
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link
                                    className="block rounded-lg px-3 py-2 font-medium text-ui-btn-bg-primary hover:bg-ui-bg-secondary transition"
                                    href="/auth"
                                    onClick={() => setHeader(false)}
                                >
                                    Log in / Register
                                </Link>
                            </li>
                        )}

                        <li className="px-3 py-2 border-t border-gray-200/50 mt-2">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ui-text-secondary">
                                Theme
                            </span>
                            <div className="flex gap-2">
                                {THEMES.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`rounded-sm border px-3 py-1.5 text-xs transition ${
                                            theme === option.value
                                                ? "border-ui-btn-bg-primary bg-ui-card-primary font-bold text-ui-text-primary"
                                                : "border-gray-300 text-ui-text-secondary hover:bg-ui-bg-secondary"
                                        }`}
                                        onClick={() => setTheme(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Header
