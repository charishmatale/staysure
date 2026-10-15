import Link from "next/link";
import { Search, ShieldCheck, Map, Star, Flame, ArrowRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PropertyCard from "@/components/PropertyCard";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session?.user && (session.user as any).role === "OWNER") {
    redirect("/owner/dashboard");
  }

  // Popular PGs: ordered by highest rating and popularity
  const popularProperties = await prisma.property.findMany({
    orderBy: [
      { rating: "desc" },
      { monthlyRent: "asc" }
    ],
    take: 6,
  });

  // Verified Properties
  const verifiedProperties = await prisma.property.findMany({
    where: { isVerified: "VERIFIED" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 opacity-95"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck size={16} /> 100% Student Verified PG & Hostel Finder
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white leading-tight">
            Find Safe & Verified PGs <br className="hidden md:block" />
            Near Your <span className="text-teal-400">College.</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-slate-300 font-light">
            Compare student accommodations by price, gender, sharing type, safety, food, and verified student reviews.
          </p>

          {/* Search Dropdown Form */}
          <form 
            action="/search" 
            className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-2.5 flex flex-col sm:flex-row gap-2 shadow-2xl border border-white/20"
          >
            <select 
              name="area" 
              className="flex-1 px-5 py-4 bg-white/95 text-slate-900 rounded-xl focus:outline-none placeholder-slate-500 font-semibold text-sm cursor-pointer"
            >
              <option value="">Select location / area...</option>
              <option value="Yendada">Yendada</option>
              <option value="MVP Colony">MVP Colony</option>
              <option value="Ram Nagar">Ram Nagar</option>
              <option value="Maharani Peta">Maharani Peta</option>
              <option value="Rushikonda">Rushikonda</option>
              <option value="Dwarakanagar">Dwarakanagar</option>
              <option value="Chinna Waltair">Chinna Waltair</option>
              <option value="Sagar Nagar">Sagar Nagar</option>
              <option value="Arilova">Arilova</option>
              <option value="Kurmannapalem">Kurmannapalem</option>
              <option value="M.V. Palem">M.V. Palem</option>
              <option value="Sri Nagar">Sri Nagar</option>
              <option value="Sheelanagar">Sheelanagar</option>
              <option value="RTC Complex">RTC Complex</option>
              <option value="Simhachalam">Simhachalam</option>
              <option value="Narasimha Nagar">Narasimha Nagar</option>
              <option value="Daba Gardens">Daba Gardens</option>
            </select>

            <button 
              type="submit" 
              className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition shadow-lg shrink-0"
            >
              <Search size={18} /> Find My PG
            </button>
          </form>

          {/* Quick Area Tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Popular Areas:</span>
            {["Yendada", "MVP Colony", "Ram Nagar", "Maharani Peta", "Rushikonda"].map((a) => (
              <Link
                key={a}
                href={`/search?area=${encodeURIComponent(a)}`}
                className="bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1 rounded-lg transition font-medium"
              >
                {a}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* POPULAR PGS SECTION */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
              <Flame size={16} className="fill-amber-500" /> Highly Recommended by Students
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Popular PGs & Hostels
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Top-rated stays with great food, high-speed Wi-Fi, safety, and positive student reviews.
            </p>
          </div>

          <Link 
            href="/search?sort=popular" 
            className="text-teal-600 dark:text-teal-400 font-bold text-sm hover:underline inline-flex items-center gap-1 shrink-0"
          >
            View All Popular PGs <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-slate-50 dark:bg-slate-800/40 py-16 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            How StaySure Works for Students
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto mb-12">
            Find, verify, and reserve your college stay in 4 easy steps without broker fees.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Map, title: "1. Filter by Location", desc: "Select area, budget, room type, and facilities." },
              { icon: ShieldCheck, title: "2. Check Verification", desc: "Ensure safety with verified owner badges." },
              { icon: Star, title: "3. Read Student Reviews", desc: "Honest feedback from students already living there." },
              { icon: CheckCircle2, title: "4. Request to Book", desc: "Direct booking request to PG owner with real-time status." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="bg-teal-50 dark:bg-teal-900/40 p-4 rounded-2xl text-teal-600 dark:text-teal-400 mb-4">
                  <step.icon size={28} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Properties Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              Verified Properties
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Accommodations inspected for hygiene, safety, and student security.
            </p>
          </div>
          <Link href="/search?verified=true" className="text-teal-600 dark:text-teal-400 font-bold text-sm hover:underline">
            View All Verified →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
}
