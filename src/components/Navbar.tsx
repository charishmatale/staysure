"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Home, Compass, BookmarkCheck, LayoutDashboard, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const userEmail = (session?.user as any)?.email;
  const userName = session?.user?.name;

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link 
              href={role === "OWNER" ? "/owner/dashboard" : "/"} 
              className="text-2xl font-black text-teal-600 dark:text-teal-400 tracking-tight flex items-center gap-1.5"
            >
              <span>StaySure</span>
            </Link>

            <Link 
              href="/search" 
              className="text-slate-600 dark:text-slate-300 font-semibold text-sm hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center gap-1.5"
            >
              <Compass size={16} /> Find PG
            </Link>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {session ? (
              <div className="flex items-center gap-2 md:gap-3">
                {role === "STUDENT" && (
                  <Link
                    href="/student/dashboard"
                    className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-1.5 border border-teal-200/60 dark:border-teal-700/40"
                  >
                    <BookmarkCheck size={16} /> My Bookings
                  </Link>
                )}

                {role === "OWNER" && (
                  <Link
                    href="/owner/dashboard"
                    className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-1.5 border border-teal-200/60 dark:border-teal-700/40"
                  >
                    <LayoutDashboard size={16} /> Owner Dashboard
                  </Link>
                )}

                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <User size={13} className="text-teal-600 dark:text-teal-400" />
                  <span className="max-w-[120px] truncate" title={userEmail || userName}>
                    {userName || userEmail}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase">
                    {role}
                  </span>
                </div>

                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })} 
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs md:text-sm transition shadow-sm"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
