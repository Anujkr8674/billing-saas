import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextGen Billing Software",
  description: "Advanced billing & invoicing platform",
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AlertModalProvider } from "@/components/providers/AlertModalProvider";
import { Toaster } from "sonner";
import { cookies } from "next/headers";

import WhatsAppButton from "@/components/WhatsAppButton";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider 
          initialAdminPageTheme={cookieStore.get("adminPageTheme")?.value}
          initialUserPageTheme={cookieStore.get("userPageTheme")?.value}
          initialAdminTheme={cookieStore.get("adminSidebarTheme")?.value ? decodeURIComponent(cookieStore.get("adminSidebarTheme")!.value) : undefined}
          initialUserTheme={cookieStore.get("userSidebarTheme")?.value ? decodeURIComponent(cookieStore.get("userSidebarTheme")!.value) : undefined}
        >
          <AlertModalProvider>
            {children}
            <Toaster richColors position="top-right" />
            <WhatsAppButton />
          </AlertModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
