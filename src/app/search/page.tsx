import { prisma } from "@/lib/prisma";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  
  const budget = params.budget ? parseFloat(params.budget) : 30000;
  const area = params.area || undefined;
  const verifiedOnly = params.verified === "true";
  const foodOnly = params.food === "true";
  const sort = params.sort || "popular";

  const genders = params.gender ? params.gender.split(",").filter(Boolean) : [];
  const roomTypes = params.roomType ? params.roomType.split(",").filter(Boolean) : [];
  const facilities = params.facility ? params.facility.split(",").filter(Boolean) : [];

  const whereClause: any = {
    monthlyRent: { lte: budget }
  };

  if (area) {
    whereClause.address = { contains: area };
  }

  if (verifiedOnly) {
    whereClause.isVerified = "VERIFIED";
  }

  if (foodOnly) {
    whereClause.foodAvailable = true;
  }

  if (genders.length > 0) {
    whereClause.genderPreference = { in: genders };
  }

  if (roomTypes.length > 0) {
    whereClause.roomType = { in: roomTypes };
  }

  if (facilities.length > 0) {
    whereClause.AND = facilities.map(f => ({
      facilities: { contains: f }
    }));
  }

  let orderBy: any = [{ rating: 'desc' }, { monthlyRent: 'asc' }];
  if (sort === "price_asc") {
    orderBy = [{ monthlyRent: 'asc' }];
  } else if (sort === "price_desc") {
    orderBy = [{ monthlyRent: 'desc' }];
  } else if (sort === "popular") {
    orderBy = [{ rating: 'desc' }, { monthlyRent: 'asc' }];
  }

  const properties = await prisma.property.findMany({
    where: whereClause,
    orderBy,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SearchFilters />
        </div>
        <div className="md:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {properties.length} {properties.length === 1 ? "Property" : "Properties"} Found
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Verified and filtered results matching your criteria
              </p>
            </div>
            
            {(genders.length > 0 || roomTypes.length > 0 || facilities.length > 0 || area || verifiedOnly) && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs text-slate-400 mr-1 font-semibold">Active filters:</span>
                {area && <span className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-md text-xs font-semibold">📍 {area}</span>}
                {genders.map(g => (
                  <span key={g} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md text-xs font-semibold">{g}</span>
                ))}
                {roomTypes.map(r => (
                  <span key={r} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md text-xs font-semibold">{r}</span>
                ))}
                {facilities.map(f => (
                  <span key={f} className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-md text-xs font-semibold">{f}</span>
                ))}
                {verifiedOnly && <span className="bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-md text-xs font-semibold">Verified</span>}
              </div>
            )}
          </div>

          {properties.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No properties matched your filters.
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                Try unchecking some facilities, adjusting your budget range, or selecting "All Locations".
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
