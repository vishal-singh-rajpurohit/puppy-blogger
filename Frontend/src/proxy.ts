import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth';
import { Session } from 'next-auth';
import { AuthSessionUnion } from './types/authSession.types';

const AUTH_ROUTES = ['/me']


export async function proxy(request: NextRequest) {
    const session = await auth() as Session & AuthSessionUnion;

    const { pathname } = request.nextUrl
    const isAuthRoute = AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    if (session && session.user) {
        if (session.incomplete && pathname !== '/auth/me') {
            console.log('redirecting from : 1');
            const url = new URL('/auth/me', request.url)
            url.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(new URL(url))
        }
        if (!session.incomplete && pathname === '/auth/me') {
            console.log('redirecting from : 2');
            const url = new URL('/me/profile/', request.url)
            url.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(new URL(url))
        }
        if (isAuthRoute) {
            console.log('redirecting from : 3');
            return NextResponse.next()
        }
        if (pathname === "/" || pathname === "/auth") {
            const url = new URL('/me/feed/', request.url)
            return NextResponse.redirect(new URL(url))
        }
    }

    else if (isAuthRoute) {
        const url = new URL('/auth', request.url)
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(new URL(url))
    }

    else if (pathname === '/auth/me') {
        console.log('redirecting from : 5');
        const url = new URL('/auth', request.url)
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(new URL(url))
    }


    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!api/auth|_next/static|_next/image|favicon.ico|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}