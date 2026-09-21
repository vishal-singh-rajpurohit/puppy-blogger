'use client'
import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { AuthSessionUnion } from "@/types/authSession.types"

type FormState = {
    name: string
    username: string
}

const initialForm: FormState = {
    name: "",
    username: ""
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


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function AuthPage() {
    const { data } = useSession()
    const router = useRouter()
    const [form, setForm] = useState<FormState>(initialForm)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        setIsSubmitting(true)
        try {
            console.log('data: ', data)
            console.log("(data as typeof data & AuthSessionUnion)?.access_token: ", (data as typeof data & AuthSessionUnion)?.access_token)
            const resp = await fetch(
                `${BACKEND_URL}/auth/register/detail`,
                {
                    method: "PUT",
                    credentials: "include",
                    body: JSON.stringify({
                        username: form.username,
                        name: form.name
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${(data as typeof data & AuthSessionUnion)?.access_token}`
                    },

                });

            console.log(await resp)
            const result = await resp.json()

            if (result.statusCode === 200) {
                await signOut({});
                router.push('/me/profile');
            }


        } catch (error) {
            console.log(error)
            setError("Something went wrong. Try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        async function debounce() {
            try {
                if (form.username) {
                    const resp = await fetch(
                        `${BACKEND_URL}/auth/check/username`,
                        {
                            method: "POST",
                            body: JSON.stringify({ username: form.username }),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    );
                    const data = await resp.json();
                    if (!data.body.avilable) {
                        setError("Username is already taken");
                    }
                }
            } catch (error) {
                console.log("Error in searching username: ", error)
            }
        }
        const timeout = setTimeout(debounce, 1500);
        return () => clearTimeout(timeout)
    }, [form, setForm])

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
                            className={`flex-1 rounded-sm py-2 text-sm font-medium transition bg-ui-btn-bg-primary text-ui-btn-text-primary}`} >
                            Complete
                        </button>
                    </div>

                    <p className="mt-1 text-sm text-ui-text-secondary">
                        Complete your details.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <TextField
                            id="username"
                            label="Username"
                            value={form.username}
                            onChange={(value) => updateField("username", value)}
                            autoComplete="username"
                        />
                        <TextField
                            id="name"
                            label="name"
                            value={form.name}
                            onChange={(value) => updateField("name", value)}
                            autoComplete="name"
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 rounded-sm bg-ui-btn-bg-primary px-4 py-2.5 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover disabled:opacity-60"
                        >
                            {isSubmitting ? "Verifying..." : "Submit"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}
