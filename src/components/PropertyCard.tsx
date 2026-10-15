import Link from 'next/link';
import { MapPin, Star, ShieldCheck, Flame } from 'lucide-react';

export default function PropertyCard({ property }: { property: any }) {
  const images = JSON.parse(property.images || '[]');
  const facilities = JSON.parse(property.facilities || '[]');
  const isPopular = property.rating >= 4.6;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col h-full group">
      <div className="h-52 bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={property.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image Available</div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {property.isVerified === 'VERIFIED' && (
            <div className="bg-green-600/95 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <ShieldCheck size={13} /> Verified
            </div>
          )}
          {isPopular && (
            <div className="bg-amber-500/95 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Flame size={13} /> Popular
            </div>
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-xl">
          {property.genderPreference}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">
            {property.name}
          </h3>
          <div className="flex items-center text-amber-500 text-xs bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg font-black shrink-0 ml-2">
            <Star size={13} fill="currentColor" className="mr-1" /> {property.rating || "New"}
          </div>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mb-4 font-medium">
          <MapPin size={14} className="text-teal-600 dark:text-teal-400 shrink-0" /> {property.address}, {property.city}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
          {facilities.slice(0, 3).map((f: string) => (
            <span key={f} className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded-md">
              {f}
            </span>
          ))}
          {facilities.length > 3 && (
            <span className="text-[11px] text-slate-400 font-medium self-center">
              +{facilities.length - 3} more
            </span>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700/70">
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{property.monthlyRent}</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">/mo</span>
          </div>
          <Link 
            href={`/property/${property.id}`} 
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
