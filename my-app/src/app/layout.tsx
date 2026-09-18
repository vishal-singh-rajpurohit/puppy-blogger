"use client";

import type { Metadata } from "next";
import { Provider } from 'react-redux';
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import QueryProvider from "../context/QueryClientContext";
import { AppProvider } from "../context/AppContext";
import { store } from "../context/store/store";


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full`}>
      <body className="min-h-full flex flex-col bg-ui-bg-primary">
        <Header />
        <QueryProvider>
          <Provider store={store()} >
            <AppProvider>
              {children}
            </AppProvider>
          </Provider>
        </QueryProvider>
        <Footer />
      </body>
    </html>
  );
}
