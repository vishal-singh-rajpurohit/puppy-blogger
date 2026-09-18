import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

const authProvider = [
    CredentialsProvider({
        id: "credentials",
        name: "Demo Account",
        credentials: {
            email: {
                label: "Email",
                type: "email",
                placeholder: "demo_user@inboxpilot.ai",
            },
            name: { label: "Name", type: "text", placeholder: "Demo User" },
        },
        async authorize(credentials) {
            if (!credentials) return null;

            const email = (credentials.email as string) || "demo_user@inboxpilot.ai";
            const name = (credentials.name as string) || "Demo User";

            try {
                const backendUrl = process.env.BACKEND_API_URL;

                // Replaced axios with Edge-compatible native fetch
                const res = await fetch(`${backendUrl}/api/v1/auth/oauth-login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        name: name,
                        image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
                        provider: "demo",
                        provider_account_id: `demo-${uuid_hash(email)}`,
                        token_expires_at: new Date(
                            Date.now() + 30 * 86400 * 1000,
                        ).toISOString(),
                    }),
                });

                if (!res.ok) {
                    console.error("Backend auth failed status:", res.status);
                    return null;
                }

                const data = await res.json();

                if (data && data.access_token) {
                    return {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        image: data.user.image,
                        backendToken: data.access_token,
                        preferredLanguage: data.user.preferred_language || "en",
                        preferredAiModel: data.user.preferred_ai_model || "meta-llama/Llama-3.2-3B-Instruct",
                        provider: "demo",
                    };
                }
                return null;
            } catch (e) {
                console.error("Credentials authorize failed:", e);
                return null;
            }
        },
    }),
]

const { auth, handlers, signIn, signOut } = NextAuth({
    providers: authProvider,
    ...({
        httpOptions: {
            timeout: 120000,
        },
    } as any),
    callbacks: {
        async jwt({ token, user, account, profile, session, trigger }) {
            if (trigger === "update" && session) {
                if (session.preferredLanguage) token.preferredLanguage = session.preferredLanguage;
                if (session.preferredAiModel) token.preferredAiModel = session.preferredAiModel;
            }
        }
    }
});

export { handlers }