import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const displayFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "ConvoLens",
  description: "Premium conversation analysis for chats, screenshots, transcripts, and multilingual discussions.",
  icons: {
    icon: "/convolens-mark.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable} bg-canvas text-ink antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

