#!/bin/bash
set -e

echo "Installing next-themes..."
npm install next-themes

echo "Updating Prisma schema..."
cat << 'EOF' > prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      String   // STUDENT, OWNER, ADMIN
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  properties Property[]
  reviews    Review[]
  bookings   Booking[]
}

model Property {
  id               String   @id @default(cuid())
  name             String
  address          String
  city             String
  monthlyRent      Float
  genderPreference String   
  roomType         String   
  facilities       String   
  foodAvailable    Boolean
  distance         Float    
  rating           Float    @default(0)
  isVerified       String   @default("PENDING") 
  images           String   
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  ownerId String
  owner   User     @relation(fields: [ownerId], references: [id])
  reviews Review[]
  bookings Booking[]
}

model Review {
  id         String   @id @default(cuid())
  rating     Int
  comment    String
  createdAt  DateTime @default(now())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  studentId  String
  student    User     @relation(fields: [studentId], references: [id])
}

model Booking {
  id         String   @id @default(cuid())
  status     String   @default("Pending") // Pending, Accepted, Rejected
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  studentId  String
  student    User     @relation(fields: [studentId], references: [id])
}
EOF

echo "Pushing DB schema..."
npx prisma db push

echo "Writing Layout..."
cat << 'EOF' > src/app/layout.tsx
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
EOF

echo "Writing ThemeSwitcher..."
cat << 'EOF' > src/components/ThemeSwitcher.tsx
"use client";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="relative group">
      <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300">
        {theme === 'dark' ? <Moon size={20} /> : theme === 'light' ? <Sun size={20} /> : <Monitor size={20} />}
      </button>
      <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <button onClick={() => setTheme('light')} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
          <Sun size={16} /> Light Theme
        </button>
        <button onClick={() => setTheme('dark')} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
          <Moon size={16} /> Dark Theme
        </button>
        <button onClick={() => setTheme('system')} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
          <Monitor size={16} /> System
        </button>
      </div>
    </div>
  );
}
EOF

echo "Writing Navbar..."
cat << 'EOF' > src/components/Navbar.tsx
"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">StaySure</Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/search" className="text-slate-600 dark:text-slate-300 font-medium hover:text-teal-600 dark:hover:text-teal-400 transition">Find PG</Link>
            {session ? (
              <div className="flex items-center gap-4">
                <Link 
                  href={(session.user as any)?.role === 'ADMIN' ? '/admin/dashboard' : (session.user as any)?.role === 'OWNER' ? '/owner/dashboard' : '/student/dashboard'}
                  className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition"
                >
                  {session.user?.name}
                </Link>
                <button onClick={() => signOut()} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition">Logout</button>
              </div>
            ) : null}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
EOF

echo "Writing Login Page..."
cat << 'EOF' > src/app/login/page.tsx
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [tab, setTab] = useState<"STUDENT" | "OWNER">("STUDENT");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!isLogin) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role: tab })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }
      }
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid credentials");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-700">
        
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setTab("STUDENT")} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${tab === "STUDENT" ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow" : "text-slate-500 dark:text-slate-300"}`}
          >
            Student Access
          </button>
          <button 
            onClick={() => setTab("OWNER")} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${tab === "OWNER" ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow" : "text-slate-500 dark:text-slate-300"}`}
          >
            PG Owner Access
          </button>
        </div>

        <h2 className="text-2xl font-extrabold text-center mb-6 text-slate-800 dark:text-slate-100">
          {isLogin ? `Login as ${tab === 'STUDENT' ? 'Student' : 'Owner'}` : `Register as ${tab === 'STUDENT' ? 'Student' : 'Owner'}`}
        </h2>
        
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition" 
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition" 
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition" 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 transition disabled:opacity-50 shadow-md mt-6">
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Register")}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm font-medium">
          {isLogin ? (
            <p className="text-slate-500 dark:text-slate-400">Don't have an account? <button onClick={() => { setIsLogin(false); setError(""); }} className="text-teal-600 dark:text-teal-400 hover:underline">Register here</button></p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Already have an account? <button onClick={() => { setIsLogin(true); setError(""); }} className="text-teal-600 dark:text-teal-400 hover:underline">Log in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
EOF

echo "Writing PropertyCard..."
cat << 'EOF' > src/components/PropertyCard.tsx
import Link from 'next/link';
import { MapPin, Star, ShieldCheck } from 'lucide-react';

export default function PropertyCard({ property }: { property: any }) {
  const images = JSON.parse(property.images || '[]');
  const facilities = JSON.parse(property.facilities || '[]');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col h-full">
      <div className="h-52 bg-slate-200 dark:bg-slate-700 relative">
        {images.length > 0 && <img src={images[0]} alt={property.name} className="w-full h-full object-cover" />}
        {property.isVerified === 'VERIFIED' && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
            <ShieldCheck size={14} /> Verified Hostel/PG
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">{property.name}</h3>
          <div className="flex items-center text-amber-500 text-sm bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md font-bold">
            <Star size={14} fill="currentColor" className="mr-1" /> {property.rating}
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5 mb-4">
          <MapPin size={16} /> {property.address}, {property.city}
        </p>
        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {facilities.slice(0, 3).map((f: string) => (
            <span key={f} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-md">{f}</span>
          ))}
          {facilities.length > 3 && <span className="text-xs text-slate-400 font-medium">+{facilities.length - 3} more</span>}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{property.monthlyRent}</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/mo</span>
          </div>
          <Link href={`/property/${property.id}`} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition shadow-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
EOF

echo "Done writing Phase 1 components."
