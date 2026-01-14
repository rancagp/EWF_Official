// Halaman Home

"use client";

import React, { ReactNode } from "react";
import Head from "next/head";
import NavBar from "@/components/organisms/NavBar";
import Footer from "@/components/organisms/Footer";
import DateTimeDisplay from "@/components/organisms/DateTimeDisplay";

interface PageTemplateProps {
    title?: string;
    description?: string;
    children: ReactNode;
}

export default function PageTemplate({ title, description, children }: PageTemplateProps) {
    const pageTitle = title ? `${title} - PT. EquityWorld Futures` : "PT. EquityWorld Futures";
    const pageDescription = description || "PT. EquityWorld Futures adalah perusahaan pialang berjangka terpercaya di Indonesia.";
    
    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />

                {/* Favicon & Icons */}
                <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="48x48" href="/favicon/favicon-48x48.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
                <link rel="manifest" href="/favicon/site.webmanifest" />
                <link rel="shortcut icon" href="/favicon/favicon.ico" />
                <meta name="theme-color" content="#ffffff" />
                <meta name="apple-mobile-web-app-title" content="EWF" />

                {/* Font: Montserrat */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </Head>

            <DateTimeDisplay />
            <NavBar />

            <main>{children}</main>
            <Footer />
        </>
    );
}
