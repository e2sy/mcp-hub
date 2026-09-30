import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetMono = JetBrains_Mono({
  variable: "--font-jet-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "MCP Hub — One command to install any MCP server",
    template: "%s — MCP Hub",
  },
  description: "The open directory and auto-installer for Model Context Protocol servers. Browse 30+ verified MCP servers, install them in one command for Claude Desktop, Cursor, Cline, and more.",
  keywords: ["MCP", "Model Context Protocol", "Claude", "Cursor", "AI tools", "MCP server", "MCP directory", "Claude Desktop", "AI agents"],
  authors: [{ name: "MCP Hub" }],
  openGraph: {
    title: "MCP Hub — Install any MCP server in one command",
    description: "The open directory and auto-installer for Model Context Protocol servers.",
    siteName: "MCP Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP Hub — Install any MCP server in one command",
    description: "The open directory and auto-installer for Model Context Protocol servers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
