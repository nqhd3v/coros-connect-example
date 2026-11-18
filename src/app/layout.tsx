import { Author } from "@shared/components/atoms/author";
import { Toaster } from "@shared/components/atoms/toast";
import { cn } from "@shared/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "coros-connect",
  description: "query health data from COROS MCP",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-mono", jetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col relative">
        {children}
        <Suspense>
          <Author />
        </Suspense>
        <Suspense>
          <Analytics />
        </Suspense>
      </body>
      <Toaster />
    </html>
  );
}
