"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, XCircle, ListFilter, Building2, User, Mail, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface BookingItem {
  id: string;
  status: string;
  createdAt: string | Date;
  student: {
    name: string;
    email: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    monthlyRent: number;
    roomType: string;
    genderPreference: string;
  };
}

export default function OwnerInquiriesTabs({ bookings }: { bookings: BookingItem[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Group bookings by status
  const pendingList = bookings.filter(b => b.status === "Pending");
  const acceptedList = bookings.filter(b => b.status === "Accepted");
  const declinedList = bookings.filter(b => b.status === "No Availability" || b.status === "Rejected");

  // Determine initial active tab: if there are pending, show pending first!
  const [activeTab, setActiveTab] = useState<"PENDING" | "ACCEPTED" | "DECLINED" | "ALL">(
    pendingList.length > 0 ? "PENDING" : acceptedList.length > 0 ? "ACCEPTED" : "ALL"
  );

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setLoadingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const currentDisplayList = 
    activeTab === "PENDING" ? pendingList :
    activeTab === "ACCEPTED" ? acceptedList :
    activeTab === "DECLINED" ? declinedList :
    bookings;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ListFilter className="text-teal-600 dark:text-teal-400" /> Manage Booking Requests
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and track student applications categorized by approval status.
          </p>
        </div>

        {/* Status Category Filter Tabs */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "PENDING"
                ? "bg-amber-500 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Clock size={14} /> To Be Accepted ({pendingList.length})
          </button>

          <button
            onClick={() => setActiveTab("ACCEPTED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "ACCEPTED"
                ? "bg-green-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 size={14} /> Accepted ({acceptedList.length})
          </button>

          <button
            onClick={() => setActiveTab("DECLINED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "DECLINED"
                ? "bg-red-500 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <XCircle size={14} /> Not Available ({declinedList.length})
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "ALL"
                ? "bg-slate-800 dark:bg-slate-900 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            All ({bookings.length})
          </button>
        </div>
      </div>

      {/* Description Banner for Active Tab */}
      <div className="my-6">
        {activeTab === "PENDING" && (
          <div className="p-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <span>⏳ <strong>Pending Requests</strong>: Students waiting for your decision. Click <strong>Accept</strong> to confirm their room, or <strong>No Availability</strong> if full.</span>
          </div>
        )}

        {activeTab === "ACCEPTED" && (
          <div className="p-4 bg-green-50/80 dark:bg-green-950/20 border border-green-200/60 dark:border-green-800/40 rounded-2xl text-xs text-green-800 dark:text-green-300 flex items-center justify-between">
            <span>✅ <strong>Accepted Stays</strong>: Bookings you have approved. These students have confirmed their room request.</span>
          </div>
        )}

        {activeTab === "DECLINED" && (
          <div className="p-4 bg-red-50/80 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 rounded-2xl text-xs text-red-800 dark:text-red-300 flex items-center justify-between">
            <span>❌ <strong>Not Available Stays</strong>: Requests you marked as unavailable or full.</span>
          </div>
        )}
      </div>

      {/* Bookings List Display */}
      {currentDisplayList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/60 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
            {activeTab === "PENDING" && "No pending requests at the moment! All inquiries have been handled."}
            {activeTab === "ACCEPTED" && "No accepted bookings yet. Check 'To Be Accepted' to confirm student requests."}
            {activeTab === "DECLINED" && "No declined or unavailable requests."}
            {activeTab === "ALL" && "No booking requests received yet for your properties."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentDisplayList.map((b) => (
            <div
              key={b.id}
              className="p-5 md:p-6 bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 dark:hover:border-slate-600 transition"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-black text-lg text-slate-900 dark:text-white">
                    {b.property.name}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                    {b.property.address}
                  </span>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">
                    ₹{b.property.monthlyRent}/mo
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <User size={14} className="text-teal-600 dark:text-teal-400" />
                    <span>Student: {b.student.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Mail size={14} />
                    <span>{b.student.email}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={14} />
                    <span>
                      {new Date(b.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions Column */}
              <div className="flex flex-wrap items-center gap-3 self-end md:self-center shrink-0">
                {b.status === "Pending" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(b.id, "Accepted")}
                      disabled={loadingId === b.id}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={15} /> Accept Request
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(b.id, "No Availability")}
                      disabled={loadingId === b.id}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <XCircle size={15} /> No Availability
                    </button>
                  </div>
                ) : b.status === "Accepted" ? (
                  <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/40 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Accepted Stay
                    </span>
                    <button
                      onClick={() => handleUpdateStatus(b.id, "No Availability")}
                      disabled={loadingId === b.id}
                      className="text-slate-400 hover:text-red-500 text-xs font-medium underline transition"
                    >
                      Change to No Availability
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/40 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <XCircle size={14} /> Not Available
                    </span>
                    <button
                      onClick={() => handleUpdateStatus(b.id, "Accepted")}
                      disabled={loadingId === b.id}
                      className="text-slate-400 hover:text-green-600 text-xs font-medium underline transition"
                    >
                      Change to Accept
                    </button>
                  </div>
                )}

                <Link
                  href={`/property/${b.property.id}`}
                  className="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
                  title="View Property Page"
                >
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
