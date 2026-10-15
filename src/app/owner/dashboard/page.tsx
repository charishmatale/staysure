import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddPropertyModal from "@/components/AddPropertyModal";
import OwnerInquiriesTabs from "@/components/OwnerInquiriesTabs";
import { Building, Users, Clock, CheckCircle2, ShieldCheck, MapPin, XCircle } from "lucide-react";
import Link from "next/link";

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "OWNER") redirect("/login");
  const ownerId = (session.user as any).id;
  const ownerEmail = (session.user as any).email;
  const ownerName = session.user?.name || "PG Owner";

  // STRICT ISOLATION: Fetch properties and bookings belonging ONLY to THIS owner
  const properties = await prisma.property.findMany({
    where: { ownerId },
    include: {
      bookings: {
        include: {
          student: { select: { name: true, email: true } },
          property: true
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Flatten all bookings for this owner
  const allBookings = properties.flatMap(p => p.bookings);

  const pendingCount = allBookings.filter(b => b.status === "Pending").length;
  const acceptedCount = allBookings.filter(b => b.status === "Accepted").length;
  const notAvailableCount = allBookings.filter(
    b => b.status === "No Availability" || b.status === "Rejected"
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              PG Owner Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">Account: {ownerEmail}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            Welcome, {ownerName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your accommodations, vacancy status, and student booking requests.
          </p>
        </div>

        <AddPropertyModal />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-2xl">
            <Building size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{properties.length}</p>
            <p className="text-xs text-slate-500 font-medium">My Listed PGs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
            <p className="text-xs text-slate-500 font-medium">To Be Accepted</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-2xl">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-green-600 dark:text-green-400">{acceptedCount}</p>
            <p className="text-xs text-slate-500 font-medium">Accepted Stays</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">{notAvailableCount}</p>
            <p className="text-xs text-slate-500 font-medium">Not Available</p>
          </div>
        </div>
      </div>

      {/* SEPARATED BOOKINGS SECTION (To Be Accepted, Accepted, Not Available) */}
      <OwnerInquiriesTabs bookings={allBookings as any} />

      {/* My Listed Properties Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              My Listed Properties ({properties.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hostels and PGs published under {ownerEmail}
            </p>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-3">
              You haven't added any PG listings yet.
            </p>
            <AddPropertyModal />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{p.name}</h3>
                    {p.isVerified === "VERIFIED" && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3">
                    <MapPin size={13} className="text-teal-600" /> {p.address}, {p.city}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
                    <span>₹{p.monthlyRent}/month</span>
                    <span>•</span>
                    <span>{p.genderPreference}</span>
                    <span>•</span>
                    <span>{p.roomType}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {p.bookings.length} {p.bookings.length === 1 ? "Inquiry" : "Inquiries"}
                  </span>
                  <Link
                    href={`/property/${p.id}`}
                    className="font-bold text-slate-700 dark:text-slate-200 hover:text-teal-600 hover:underline"
                  >
                    View Page →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
