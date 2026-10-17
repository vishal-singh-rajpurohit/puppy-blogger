'use client'
import { useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react"

type Step = "email" | "otp" | "password" | "success"

export default function ForgotPasswordPage() {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const [step, setStep] = useState<Step>("email")
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Step 1: Send OTP
    async function handleSendOtp(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const res = await fetch(`${BACKEND_URL}/auth/reset/password/otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            })
            const data = await res.json()

            if (res.ok && data?.statusCode === 200) {
                setMessage("A 6-digit code has been sent to your email.")
                setStep("otp")
            } else {
                setError(data?.message || "Failed to send reset code. Please check your email.")
            }
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Step 2: Verify OTP
    async function handleVerifyOtp(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const res = await fetch(`${BACKEND_URL}/auth/reset/password/otp/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ otp: otp.trim() }),
            })
            const data = await res.json()

            if (res.ok && data?.statusCode === 200) {
                setMessage(null)
                setStep("password")
            } else {
                setError(data?.message || "Invalid or expired code. Please try again.")
            }
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Step 3: Set New Password
    async function handleResetPassword(e: FormEvent) {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.")
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch(`${BACKEND_URL}/auth/reset/password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    password,
                    conform_password: confirmPassword
                }),
            })
            const data = await res.json()

            if (res.ok && data?.statusCode === 200) {
                setStep("success")
            } else {
                setError(data?.message || "Failed to reset password. Please try again.")
            }
        } catch {
            setError("Network error. Please try again.")
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
                    {step === "email" && (
                        <>
                            <h1 className="text-xl font-semibold text-ui-text-primary">
                                Reset password
                            </h1>
                            <p className="mt-1 text-sm text-ui-text-secondary">
                                Enter your email address and we&apos;ll send you a verification code to reset your password.
                            </p>

                            <form onSubmit={handleSendOtp} className="mt-6 flex flex-col gap-4">
                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ui-text-primary">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                {error && <p className="text-sm text-red-500">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-2 rounded-sm bg-ui-btn-bg-primary px-4 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover disabled:opacity-60"
                                >
                                    {isSubmitting ? "Sending code..." : "Send reset code"}
                                </button>
                            </form>
                        </>
                    )}

                    {step === "otp" && (
                        <>
                            <h1 className="text-xl font-semibold text-ui-text-primary">
                                Enter verification code
                            </h1>
                            <p className="mt-1 text-sm text-ui-text-secondary">
                                We sent a 6-digit code to <span className="font-medium text-ui-text-primary">{email}</span>.
                            </p>

                            <form onSubmit={handleVerifyOtp} className="mt-6 flex flex-col gap-4">
                                <div>
                                    <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-ui-text-primary">
                                        Verification Code
                                    </label>
                                    <input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        required
                                        placeholder="123456"
                                        className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 text-center font-mono text-lg tracking-widest text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                                    />
                                </div>

                                {message && <p className="text-xs text-green-700">{message}</p>}
                                {error && <p className="text-sm text-red-500">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || otp.length < 6}
                                    className="mt-2 rounded-sm bg-ui-btn-bg-primary px-4 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover disabled:opacity-60"
                                >
                                    {isSubmitting ? "Verifying..." : "Verify code"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("email")
                                        setError(null)
                                        setMessage(null)
                                    }}
                                    className="text-xs text-ui-text-secondary hover:underline"
                                >
                                    Use a different email
                                </button>
                            </form>
                        </>
                    )}

                    {step === "password" && (
                        <>
                            <h1 className="text-xl font-semibold text-ui-text-primary">
                                Create new password
                            </h1>
                            <p className="mt-1 text-sm text-ui-text-secondary">
                                Choose a strong password with at least 8 characters.
                            </p>

                            <form onSubmit={handleResetPassword} className="mt-6 flex flex-col gap-4">
                                <div>
                                    <label htmlFor="new-pass" className="mb-1.5 block text-sm font-medium text-ui-text-primary">
                                        New password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new-pass"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={8}
                                            className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 pr-10 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-ui-text-secondary transition hover:text-ui-text-secondary-hover"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirm-pass" className="mb-1.5 block text-sm font-medium text-ui-text-primary">
                                        Confirm new password
                                    </label>
                                    <input
                                        id="confirm-pass"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="w-full rounded-sm bg-ui-bg-secondary px-3.5 py-2.5 text-sm text-ui-text-primary outline-none ring-1 ring-inset ring-transparent transition focus:ring-ui-btn-bg-primary"
                                    />
                                </div>

                                {error && <p className="text-sm text-red-500">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-2 rounded-sm bg-ui-btn-bg-primary px-4 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover disabled:opacity-60"
                                >
                                    {isSubmitting ? "Updating..." : "Update password"}
                                </button>
                            </form>
                        </>
                    )}

                    {step === "success" && (
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto text-green-600" size={44} />
                            <h1 className="mt-4 text-xl font-semibold text-ui-text-primary">
                                Password updated!
                            </h1>
                            <p className="mt-2 text-sm text-ui-text-secondary">
                                Your password has been successfully reset. You can now log in with your new password.
                            </p>
                            <Link
                                href="/auth"
                                className="mt-6 inline-block w-full rounded-sm bg-ui-btn-bg-primary px-4 py-2.5 text-center text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover"
                            >
                                Back to Log in
                            </Link>
                        </div>
                    )}

                    {step !== "success" && (
                        <div className="mt-6 border-t border-gray-200/40 pt-4 text-center">
                            <Link
                                href="/auth"
                                className="inline-flex items-center gap-1.5 text-sm text-ui-text-secondary hover:text-ui-text-primary hover:underline"
                            >
                                <ArrowLeft size={14} /> Back to Log in
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
