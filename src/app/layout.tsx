import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@shared/lib/utils";
import { Toaster } from "@shared/components/atoms/toast";
import "./globals.css";
import Link from "next/link";

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
        <span className="text-xs text-gray-600 font-thin absolute bottom-5 left-1/2 -translate-x-1/2">
          a product developed by&nbsp;
          <Link
            href="https://github.com/nqhd3v"
            target="_blank"
            className="text-gray-900 font-normal"
          >
            @nqhd3v
          </Link>
        </span>
      </body>
      <Toaster />
    </html>
  );
}
