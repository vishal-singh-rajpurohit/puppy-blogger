"use client";

import type { Metadata } from "next";
import { Provider } from 'react-redux';
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import QueryProvider from "../context/QueryClientContext";
import { AppProvider } from "../context/AppContext";
import { store } from "../context/store/store";
import { SessionProvider } from "next-auth/react";


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full`}>
      <body className="min-h-full flex flex-col bg-ui-bg-primary">
        <SessionProvider>
          <QueryProvider>
            <Provider store={store()} >
              <AppProvider>
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </AppProvider>
            </Provider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
