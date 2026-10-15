#!/bin/bash
set -e

echo "Writing Student Dashboard..."
mkdir -p src/app/student/dashboard
cat << 'EOF' > src/app/student/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "STUDENT") redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { studentId: (session.user as any).id },
    include: { property: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">My Booking Requests</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't made any booking requests yet.</p>
          <Link href="/search" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Browse Properties</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">{b.property.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{b.property.address}, {b.property.city}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                b.status === 'Accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                b.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {b.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
EOF

echo "Writing Owner Dashboard..."
mkdir -p src/app/owner/dashboard
cat << 'EOF' > src/components/BookingAction.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingAction({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    router.refresh();
    setLoading(false);
  }

  if (currentStatus !== "Pending") return <span className="font-bold text-slate-500">{currentStatus}</span>;

  return (
    <div className="flex gap-2">
      <button onClick={() => updateStatus("Accepted")} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 disabled:opacity-50">Accept</button>
      <button onClick={() => updateStatus("Rejected")} disabled={loading} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50">Reject</button>
    </div>
  );
}
EOF

cat << 'EOF' > src/app/owner/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import BookingAction from "@/components/BookingAction";

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "OWNER") redirect("/login");

  const properties = await prisma.property.findMany({
    where: { ownerId: (session.user as any).id },
    include: {
      bookings: {
        include: { student: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Owner Dashboard</h1>
      
      {properties.map(p => (
        <div key={p.id} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{p.name}</h2>
          
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Booking Requests</h3>
          {p.bookings.length === 0 ? (
            <p className="text-slate-500 text-sm">No booking requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 text-sm uppercase">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {p.bookings.map(b => (
                    <tr key={b.id} className="text-slate-800 dark:text-slate-200">
                      <td className="py-4 px-4 font-semibold">{b.student.name}</td>
                      <td className="py-4 px-4">{b.student.email}</td>
                      <td className="py-4 px-4">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <BookingAction bookingId={b.id} currentStatus={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
EOF

echo "Done writing Phase 3 components."
