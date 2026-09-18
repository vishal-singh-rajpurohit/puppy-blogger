"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
    if (typeof window === 'undefined') return new QueryClient()
    browserQueryClient ??= new QueryClient()
    return browserQueryClient
}

export default function Provider({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <QueryClientProvider client={getQueryClient()}>
            {children}
        </QueryClientProvider>
    )
}