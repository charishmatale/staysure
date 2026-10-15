import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, Calendar, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "STUDENT") redirect("/login");
  const studentId = (session.user as any).id;
  const studentEmail = (session.user as any).email;
  const studentName = session.user?.name || "Student";

  // STRICT ISOLATION: Fetch ONLY booking requests made by THIS logged in student
  const bookings = await prisma.booking.findMany({
    where: { studentId },
    include: {
      property: {
        include: { owner: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Student Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">Logged in as {studentEmail}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            My Booking Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track the status of your PG and hostel room booking applications.
          </p>
        </div>

        <Link
          href="/search"
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md inline-flex items-center gap-2 self-start md:self-auto"
        >
          Explore More PGs <ArrowRight size={16} />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Room Bookings Yet</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm">
            You haven't requested any PG or hostel rooms with your account ({studentEmail}) yet.
          </p>
          <Link
            href="/search"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-md"
          >
            Browse Verified PGs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-200 dark:hover:border-slate-600 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 dark:text-white">
                    {b.property.name}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {b.property.genderPreference}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5 font-medium">
                  <MapPin size={16} /> {b.property.address}, {b.property.city}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Requested on {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span>•</span>
                  <span>Rent: <strong className="text-slate-700 dark:text-slate-200">₹{b.property.monthlyRent}/mo</strong></span>
                  <span>•</span>
                  <span>Owner: {b.property.owner?.name || "Verified Owner"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm ${
                    b.status === "Accepted"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/40"
                      : b.status === "No Availability" || b.status === "Rejected"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/40"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                  }`}
                >
                  {b.status === "Accepted" && <CheckCircle2 size={16} />}
                  {b.status === "Pending" && <Clock size={16} />}
                  {(b.status === "No Availability" || b.status === "Rejected") && <XCircle size={16} />}
                  <span>{b.status}</span>
                </div>

                <Link
                  href={`/property/${b.property.id}`}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  View PG →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
