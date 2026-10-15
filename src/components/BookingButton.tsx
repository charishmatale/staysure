"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export default function BookingButton({ propertyId, existingStatus }: { propertyId: string, existingStatus: string | null }) {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { data: session } = useSession();

  const handleBook = async () => {
    if (!session) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to submit booking request.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  if (!session) {
    return (
      <Link href="/login" className="mt-8 block w-full text-center bg-teal-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg">
        Log in as Student to Book
      </Link>
    );
  }

  if ((session?.user as any)?.role !== "STUDENT") {
    return (
      <div className="mt-8 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 text-center text-xs text-slate-500 dark:text-slate-400">
        You are logged in as a PG Owner. Room booking is reserved for student accounts.
      </div>
    );
  }

  if (existingStatus === "Pending" || status === "success") {
    return (
      <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 p-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2">
        <Clock size={18} /> Your Request: Pending Owner Approval
      </div>
    );
  }

  if (existingStatus === "Accepted") {
    return (
      <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-300 p-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2">
        <CheckCircle2 size={18} /> Your Request: Accepted by Owner
      </div>
    );
  }

  if (existingStatus === "Rejected" || existingStatus === "No Availability") {
    return (
      <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-300 p-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2">
        <XCircle size={18} /> Status: {existingStatus}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      {status === "error" && (
        <p className="text-red-600 dark:text-red-400 text-xs font-semibold text-center">{errorMsg}</p>
      )}
      <button
        onClick={handleBook}
        disabled={status === "loading"}
        className="w-full bg-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition shadow-lg disabled:opacity-50"
      >
        {status === "loading" ? "Submitting Request..." : "Request to Book Room"}
      </button>
    </div>
  );
}
