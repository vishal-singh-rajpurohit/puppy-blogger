import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


const authProvider = [
    CredentialsProvider({
        id: 'credentials',
        name: 'Puppy Blogs',
        credentials: {
            mode: {
                type: "text"
            },
            email: {
                label: "Email",
                type: "email",
            },
            password: {
                label: "Password",
                type: "password",
            },
            conform_password: {
                label: "Confirm Password",
                type: "password",
            }
        },
        async authorize(credentials) {
            if (!credentials) return null

            const email = (credentials.email as string);
            const password = (credentials.password as string);
            const conform_password = (credentials.conform_password as string);

            if (!email || !password) {
                return null
            }

            try {
                const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

                const res = await fetch(`${BACKEND_URL}/auth/oauth`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        password,
                        conform_password: conform_password || "0000"
                    })
                });

                if (!res.ok) {
                    const error = await res.json().catch(
                        () => null
                    );

                    throw new Error(
                        error?.message ||
                        "Registration failed"
                    );
                }

                const result = await res.json();

                if (result && result.success && result.body) {
                    const { user, access_token, refresh_token, incomplete } = result.body;
                    return {
                        id: user._id, // Map _id to id for NextAuth
                        email: user.email,
                        name: user?.name || "Not Avilable",
                        username: user?.username || "Not Avilable",
                        incomplete,
                        accessToken: access_token,
                        refreshToken: refresh_token,
                    };
                }
                return null;
            } catch (error) {
                console.error("Credentials authorize failed:", error);
                return null;
            }
        }
    })
];


export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: authProvider,
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const authUser = user as typeof user & {
                    accessToken?: string;
                    refreshToken?: string;
                    incomplete?: boolean;
                };

                token.userId = authUser.id;
                token.access_token = authUser.accessToken;
                token.refresh_token = authUser.refreshToken;
                token.incomplete = authUser.incomplete;
            }

            // console.log('token: ', token)
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.userId as string;

                (session as any).access_token = token.access_token;
                (session as any).refresh_token = token.refresh_token;
                (session as any).incomplete = token.incomplete;
            }
            return session;
        },
    },

    pages: {
        signIn: "/auth"
    }
})