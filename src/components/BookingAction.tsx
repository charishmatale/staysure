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
      <button onClick={() => updateStatus("No Availability")} disabled={loading} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50">No Availability</button>
    </div>
  );
}
