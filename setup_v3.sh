#!/bin/bash
set -e

echo "Writing Booking API..."
mkdir -p src/app/api/bookings/[id]

cat << 'EOF' > src/app/api/bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { propertyId } = await req.json();
  const studentId = (session.user as any).id;

  const booking = await prisma.booking.create({
    data: {
      propertyId,
      studentId,
      status: "Pending"
    }
  });

  return NextResponse.json(booking);
}
EOF

cat << 'EOF' > src/app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();
  const { id } = await params;

  const booking = await prisma.booking.update({
    where: { id },
    data: { status }
  });

  return NextResponse.json(booking);
}
EOF

echo "Writing Booking Button Component..."
cat << 'EOF' > src/components/BookingButton.tsx
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function BookingButton({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState("idle");
  const { data: session } = useSession();

  const handleBook = async () => {
    if (!session) return;
    setStatus("loading");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId })
    });
    if (res.ok) setStatus("success");
    else setStatus("error");
  }

  if ((session?.user as any)?.role !== "STUDENT") return null;

  if (status === "success") return <div className="mt-8 bg-amber-50 border border-amber-200 text-amber-700 px-8 py-4 rounded-xl font-bold text-center">Booking Request Sent (Pending)</div>;
  if (status === "error") return <div className="mt-8 bg-red-50 text-red-600 px-8 py-4 rounded-xl font-bold text-center">Error sending request.</div>;

  return (
    <button onClick={handleBook} disabled={status === "loading"} className="mt-8 w-full bg-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition shadow-lg disabled:opacity-50">
      {status === "loading" ? "Sending Request..." : "Request to Book Room"}
    </button>
  );
}
EOF

echo "Updating property details page..."
cat << 'EOF' > src/app/property/[id]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { owner: true }
  });

  if (!property) notFound();
  const images = JSON.parse(property.images || '[]');
  const facilities = JSON.parse(property.facilities || '[]');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="h-[400px] w-full bg-slate-200 dark:bg-slate-700 relative">
          {images.length > 0 ? (
            <img src={images[0]} alt={property.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">No Image Available</div>
          )}
        </div>
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{property.name}</h1>
            {property.isVerified === 'VERIFIED' && (
              <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md">
                <ShieldCheck size={18} /> Verified Property
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg flex items-center gap-2 mb-8 font-medium">
            <MapPin size={20} /> {property.address}, {property.city}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-2xl">
                <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">Property Overview</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div><p className="text-slate-500 dark:text-slate-400">Gender Preference</p><p className="font-semibold text-slate-800 dark:text-slate-200">{property.genderPreference}</p></div>
                  <div><p className="text-slate-500 dark:text-slate-400">Room Type</p><p className="font-semibold text-slate-800 dark:text-slate-200">{property.roomType}</p></div>
                  <div><p className="text-slate-500 dark:text-slate-400">Food Available</p><p className="font-semibold text-slate-800 dark:text-slate-200">{property.foodAvailable ? 'Yes' : 'No'}</p></div>
                  <div><p className="text-slate-500 dark:text-slate-400">Distance to College</p><p className="font-semibold text-slate-800 dark:text-slate-200">{property.distance} km</p></div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">Amenities & Facilities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {facilities.map((f: string) => (
                    <div key={f} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <CheckCircle size={18} className="text-teal-500" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 h-fit sticky top-24">
              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Monthly Rent</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">₹{property.monthlyRent}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">/mo</span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Managed by</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-lg">
                    {property.owner?.name?.[0] || 'O'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{property.owner?.name || 'Property Owner'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Verified Owner</p>
                  </div>
                </div>
              </div>
              
              <BookingButton propertyId={property.id} />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

echo "Done writing Phase 2 components."
