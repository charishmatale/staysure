import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MapPin, CheckCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import ReviewsSection from '@/components/ReviewsSection';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from 'next/link';

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  const isStudent = (session?.user as any)?.role === 'STUDENT';

  const property = await prisma.property.findUnique({
    where: { id },
    include: { 
      owner: true,
      reviews: {
        include: {
          student: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!property) notFound();
  
  // Strictly check if THIS particular logged in student has booked this property
  let existingBookingStatus = null;
  if (currentUserId && isStudent) {
    const userBooking = await prisma.booking.findFirst({
      where: {
        propertyId: id,
        studentId: currentUserId
      },
      orderBy: { createdAt: 'desc' }
    });
    existingBookingStatus = userBooking?.status || null;
  }

  const images = JSON.parse(property.images || '[]');
  const facilities = JSON.parse(property.facilities || '[]');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/search" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 font-semibold text-sm mb-6 transition">
        <ArrowLeft size={16} /> Back to Search
      </Link>

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
              
              <BookingButton propertyId={property.id} existingStatus={existingBookingStatus} />
              
            </div>
          </div>
        </div>
      </div>

      {/* Student Reviews & Ratings Section */}
      <ReviewsSection
        propertyId={property.id}
        initialReviews={property.reviews as any}
        averageRating={property.rating}
      />
    </div>
  );
}
