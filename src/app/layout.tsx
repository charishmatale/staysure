import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "StaySure - Verified PG & Hostel Finder",
  description: "Find verified PGs and hostels near your college.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main className="flex-1">{children}</main>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
