'use client'
import { useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

type Mode = "login" | "register"

type FormState = {
    fullname: string
    username: string
    email: string
    password: string
    newPassword: string
}

const initialForm: FormState = {
    fullname: "",
    username: "",
    email: "",
    password: "",
    newPassword: "",
}

function TextField({
    id,
    label,
    type = "text",
    value,
    onChange,
    autoComplete,
}: {
    id: string
    label: string
    type?: string
    value: string
    onChange: (value: string) => void
    autoComplete: string
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-ui-text-primary"
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                required
                className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
            />
        </div>
    )
}

function PasswordField({
    id,
    label,
    value,
    onChange,
    autoComplete,
}: {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    autoComplete: string
}) {
    const [visible, setVisible] = useState(false)

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-ui-text-primary"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    required
                    minLength={8}
                    className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 pr-10 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-ui-text-secondary transition hover:text-ui-text-secondary-hover"
                    aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    )
}

export default function AuthPage() {
    const [mode, setMode] = useState<Mode>("login")
    const [form, setForm] = useState<FormState>(initialForm)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    function switchMode(next: Mode) {
        setMode(next)
        setError(null)
        setForm(initialForm)
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        if (mode === "register" && form.password !== form.newPassword) {
            setError("Passwords don't match.")
            return
        }

        setIsSubmitting(true)
        try {
            // Replace with a real API call, e.g.:
            // await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify(form),
            // })
            await new Promise((resolve) => setTimeout(resolve, 600))
        } catch {
            setError("Something went wrong. Try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-ui-bg-primary px-4 py-12">
            <div className="w-full max-w-sm">
                <div className="flex justify-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <Image src="/icons/logo.png" alt="Puppy Blogger logo" width={40} height={40} />
                    </Link>
                </div>

                <div className="mt-8 rounded-sm bg-ui-card-primary p-8">
                    <div className="mb-6 flex rounded-sm bg-ui-bg-secondary p-1">
                        <button
                            type="button"
                            onClick={() => switchMode("login")}
                            className={`flex-1 rounded-sm py-2 text-sm font-medium transition ${mode === "login"
                                ? "bg-ui-btn-bg-primary text-ui-btn-text-primary"
                                : "text-ui-text-secondary hover:text-ui-text-secondary-hover"
                                }`}
                        >
                            Log in
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode("register")}
                            className={`flex-1 rounded-sm py-2 text-sm font-medium transition ${mode === "register"
                                ? "bg-ui-btn-bg-primary text-ui-btn-text-primary"
                                : "text-ui-text-secondary hover:text-ui-text-secondary-hover"
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    <h1 className="text-xl font-semibold text-ui-text-primary">
                        {mode === "login" ? "Welcome back" : "Create an account"}
                    </h1>
                    <p className="mt-1 text-sm text-ui-text-secondary">
                        {mode === "login"
                            ? "Log in to write and manage your posts."
                            : "Join to start writing and publishing."}
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                        {mode === "register" && (
                            <TextField
                                id="fullname"
                                label="Full Name"
                                value={form.username}
                                onChange={(value) => updateField("fullname", value)}
                                autoComplete="fullname"
                            />
                        )}
                        {mode === "register" && (
                            <TextField
                                id="username"
                                label="Username"
                                value={form.username}
                                onChange={(value) => updateField("username", value)}
                                autoComplete="username"
                            />
                        )}

                        <TextField
                            id="email"
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={(value) => updateField("email", value)}
                            autoComplete="email"
                        />

                        <PasswordField
                            id="password"
                            label="Password"
                            value={form.password}
                            onChange={(value) => updateField("password", value)}
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                        />

                        {mode === "register" && (
                            <PasswordField
                                id="newPassword"
                                label="New password"
                                value={form.newPassword}
                                onChange={(value) => updateField("newPassword", value)}
                                autoComplete="new-password"
                            />
                        )}

                        {mode === "login" && (
                            <div className="flex justify-end">
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-xs text-ui-text-secondary transition hover:text-ui-text-secondary-hover"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 rounded-sm bg-ui-btn-bg-primary px-4 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover disabled:opacity-60"
                        >
                            {isSubmitting
                                ? mode === "login"
                                    ? "Logging in..."
                                    : "Creating account..."
                                : mode === "login"
                                    ? "Log in"
                                    : "Create account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-ui-text-secondary">
                        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => switchMode(mode === "login" ? "register" : "login")}
                            className="font-medium text-ui-text-primary underline-offset-4 hover:underline"
                        >
                            {mode === "login" ? "Register" : "Log in"}
                        </button>
                    </p>
                </div>
            </div>
        </main>
    )
}
