"use client"
import { Menu, Palette } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

type Theme = "dark" | "nature" | "default"

const THEMES: { value: Theme; label: string }[] = [
    { value: 'default', label: "Default" },
    { value: "dark", label: "Dark" },
    { value: "nature", label: "Forest" },
]

function ThemesCard({ setOpenTheme, setTheme, theme }: { setTheme: (val: Theme) => void, setOpenTheme: (val: boolean) => void, theme: Theme }) {
    return (
        <ul
            role="listbox"
            className="absolute right-0 mt-2 w-32 overflow-hidden rounded-sm border border-gray-100 bg-ui-bg-primary shadow-lg"
        >
            {THEMES.map((option) => (
                <li key={option.value}>
                    <button
                        type="button"
                        role="option"
                        aria-selected={theme === option.value}
                        className={`block w-full px-3 py-2 text-left text-sm transition text-ui-text-primary hover:bg-ui-bg-secondary hover:text-ui-text-primary-hover`}
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
    const [openHeader, setHeader] = useState<boolean>(false)
    const [openProfile, setOpenProfile] = useState<boolean>(false)
    const [openTheme, setOpenTheme] = useState<boolean>(false)
    const [theme, setTheme] = useState<Theme>("default")


    useEffect(() => {
        if (theme === "default") {
            document.documentElement.removeAttribute("data-theme")
        } else {
            document.documentElement.setAttribute("data-theme", theme) // [data-theme="dark"] and remove for natural
        }
    }, [theme])

    return (
        <header className="bg-ui-bg-primary">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex-1 md:flex md:items-center md:gap-12">
                        <Link className="block" href="/">
                            <span className="sr-only">Home</span>
                            <Image src="/icons/logo.png" className="" alt="logo" width={60} height={60} />
                        </Link>
                    </div>

                    <div className="md:flex md:items-center md:gap-12">
                        <nav aria-label="Global" className="hidden md:block">
                            <ul className="flex items-center gap-6 text-sm">
                                <li>
                                    <Link className="text-ui-text-primary hover:text-ui-text-primary-hover/90" target="_blank" href="https://vishalsingh.me"> About </Link>
                                </li>

                                <li>
                                    <Link className="text-ui-text-primary hover:text-ui-text-primary-hover/50" target="_blank" href="https://vishalsingh.me"> Projects </Link>
                                </li>

                                <li>
                                    <Link className="text-ui-text-primary hover:text-ui-text-primary-hover/50" href="/me/feed"> Blog </Link>
                                </li>
                                <li className="relative">
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 rounded-sm border border-gray-300 px-2.5 py-1.5 text-gray-500 transition hover:text-gray-500/75"
                                        onClick={() => setOpenTheme((open) => !open)}
                                        aria-expanded={openTheme}
                                        aria-haspopup="listbox"
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

                        <div className="hidden md:relative md:block">
                            <Link href={'/me/profile'} >
                                <button
                                    type="button"
                                    className="overflow-hidden cursor-pointer rounded-full border border-gray-300 shadow-inner"
                                    onClick={() => setOpenProfile((open) => !open)}
                                    aria-expanded={openProfile}
                                >
                                    <span className="sr-only">Toggle dashboard menu</span>

                                    <img
                                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1160"
                                        alt=""
                                        className="size-10 object-cover"
                                    />
                                </button>
                            </Link>
                        </div>

                        <div className="block md:hidden">
                            <button
                                type="button"
                                className="rounded-sm bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75"
                                onClick={() => setHeader((open) => !open)}
                                aria-expanded={openHeader}
                            >
                                <span className="sr-only">Toggle menu</span>

                                <Menu />
                            </button>
                        </div>
                    </div>
                </div>

                <nav
                    aria-label="Mobile navigation"
                    className={`${openHeader ? "block" : "hidden"} border-t border-gray-100 py-4 md:hidden`}
                >
                    <ul className="space-y-2 text-sm">
                        {["About", "Projects", "Blog", "Profile"].map((item) => (
                            <li key={item}>
                                <Link
                                    className="block rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                                    href={`/me/${item.toLowerCase()}`}
                                    onClick={() => setHeader(false)}
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}

                        <li className="px-3 py-2">
                            <span className="mb-1.5 block text-xs text-gray-400">Theme</span>
                            <div className="flex gap-2">
                                {THEMES.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`rounded-sm border px-3 py-1.5 text-sm transition ${theme === option.value
                                            ? "border-gray-400 bg-gray-100 text-gray-900"
                                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
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
