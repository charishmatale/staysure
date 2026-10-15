#!/bin/bash
set -e

echo "Updating SearchFilters Component..."
cat << 'EOF' > src/components/SearchFilters.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [budget, setBudget] = useState(searchParams.get("budget") || "30000");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [facility, setFacility] = useState(searchParams.get("facility") || "");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (budget) params.set("budget", budget);
    if (gender) params.set("gender", gender);
    if (facility) params.set("facility", facility);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 sticky top-24">
      <h3 className="font-extrabold text-xl mb-6 text-slate-900 dark:text-white">Filters</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Area / Location</label>
        <input 
          type="text" 
          placeholder="e.g. Yendada, MVP Colony"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition" 
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Max Budget (₹{budget})</label>
        <input 
          type="range" 
          min="1000" max="30000" step="500"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full accent-teal-600"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
        <select 
          value={gender} onChange={(e) => setGender(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition"
        >
          <option value="">Any</option>
          <option value="BOYS">Boys</option>
          <option value="GIRLS">Girls</option>
          <option value="COED">Co-ed</option>
        </select>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Facility</label>
        <select 
          value={facility} onChange={(e) => setFacility(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition"
        >
          <option value="">Any</option>
          <option value="WiFi">Wi-Fi</option>
          <option value="AC">AC</option>
          <option value="Meals">Food</option>
          <option value="Laundry">Laundry</option>
        </select>
      </div>

      <button onClick={applyFilters} className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 transition shadow-md">
        Apply Filters
      </button>
    </div>
  );
}
EOF

echo "Updating Search Page..."
cat << 'EOF' > src/app/search/page.tsx
import prisma from "@/lib/prisma";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";

export default async function SearchPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const params = await searchParams;
  
  const budget = params.budget ? parseFloat(params.budget) : 30000;
  const gender = params.gender || undefined;
  const facility = params.facility || undefined;
  const area = params.area || undefined;

  const whereClause: any = {
    monthlyRent: { lte: budget }
  };

  if (gender) whereClause.genderPreference = gender;
  if (facility) whereClause.facilities = { contains: facility };
  if (area) whereClause.address = { contains: area };

  const properties = await prisma.property.findMany({
    where: whereClause,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SearchFilters />
        </div>
        <div className="md:col-span-3">
          <h2 className="text-2xl font-extrabold mb-6 text-slate-900 dark:text-white">
            {properties.length} Properties Found
          </h2>
          {properties.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No properties matched your search.</h3>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your budget or area filter.</p>
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
EOF

echo "Writing Seed for New Dataset..."
cat << 'EOF' > prisma/seed-new2.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const owner = await prisma.user.findUnique({ where: { email: 'owner@demo.com' } });
  if (!owner) throw new Error("Owner not found.");

  const dataset = [
    { name: 'Yendada Co-living 3BHK', address: 'Yendada', city: 'Visakhapatnam', monthlyRent: 10000, genderPreference: 'COED', roomType: 'TRIPLE', facilities: JSON.stringify(['WiFi', 'TV', 'Laundry']), foodAvailable: false, distance: 2.1, rating: 4.3, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']) },
    { name: 'Ram Nagar Boys Stay', address: 'Ram Nagar', city: 'Visakhapatnam', monthlyRent: 4100, genderPreference: 'BOYS', roomType: 'DOUBLE', facilities: JSON.stringify(['WiFi']), foodAvailable: false, distance: 1.5, rating: 3.9, isVerified: 'PENDING', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']) },
    { name: 'Shanthi Nivas PG', address: 'Yendada', city: 'Visakhapatnam', monthlyRent: 10000, genderPreference: 'GIRLS', roomType: 'DOUBLE', facilities: JSON.stringify(['AC', 'WiFi', 'Power Backup']), foodAvailable: true, distance: 3.0, rating: 4.8, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55dd1b31120?w=800']) },
    { name: 'Shabnams PG', address: 'Maharani Peta', city: 'Visakhapatnam', monthlyRent: 10000, genderPreference: 'GIRLS', roomType: 'SINGLE', facilities: JSON.stringify(['AC', 'WiFi', 'Meals']), foodAvailable: true, distance: 1.2, rating: 4.5, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']) },
    { name: 'Chinna Waltair Boys 2BHK', address: 'Chinna Waltair', city: 'Visakhapatnam', monthlyRent: 3400, genderPreference: 'BOYS', roomType: 'DOUBLE', facilities: JSON.stringify(['WiFi', 'Parking']), foodAvailable: false, distance: 4.2, rating: 3.5, isVerified: 'PENDING', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']) },
    { name: 'Mindi Single Room', address: 'Mindi', city: 'Visakhapatnam', monthlyRent: 5000, genderPreference: 'COED', roomType: 'SINGLE', facilities: JSON.stringify(['WiFi']), foodAvailable: false, distance: 5.5, rating: 4.0, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55dd1b31120?w=800']) },
    { name: 'Shivaji Palem Co-living', address: 'Shivaji Palem', city: 'Visakhapatnam', monthlyRent: 6000, genderPreference: 'COED', roomType: 'SINGLE', facilities: JSON.stringify(['WiFi', 'AC']), foodAvailable: false, distance: 1.8, rating: 4.2, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']) },
    { name: 'RR Executive Boys Hostel', address: 'Kurmannapalem', city: 'Visakhapatnam', monthlyRent: 5500, genderPreference: 'BOYS', roomType: 'TRIPLE', facilities: JSON.stringify(['AC', 'Meals', 'WiFi']), foodAvailable: true, distance: 2.5, rating: 4.6, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']) },
    { name: 'Lotus Ladies PG', address: 'Sagar Nagar', city: 'Visakhapatnam', monthlyRent: 7500, genderPreference: 'GIRLS', roomType: 'TRIPLE', facilities: JSON.stringify(['Meals', 'AC', 'WiFi', 'Laundry']), foodAvailable: true, distance: 1.0, rating: 4.9, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55dd1b31120?w=800']) },
    { name: 'Rushikonda 3BHK Girls', address: 'Rushikonda', city: 'Visakhapatnam', monthlyRent: 5000, genderPreference: 'GIRLS', roomType: 'DOUBLE', facilities: JSON.stringify(['AC', 'WiFi']), foodAvailable: false, distance: 0.5, rating: 4.1, isVerified: 'PENDING', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']) },
    { name: 'zap-costay PG', address: 'M.V. Palem', city: 'Visakhapatnam', monthlyRent: 5000, genderPreference: 'BOYS', roomType: 'DOUBLE', facilities: JSON.stringify(['AC', 'WiFi']), foodAvailable: false, distance: 2.2, rating: 4.3, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']) },
    { name: 'Sri Laxmi Ganapathi Ladies', address: 'Sri Nagar', city: 'Visakhapatnam', monthlyRent: 5500, genderPreference: 'GIRLS', roomType: 'TRIPLE', facilities: JSON.stringify(['Meals', 'WiFi']), foodAvailable: true, distance: 1.1, rating: 4.4, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55dd1b31120?w=800']) },
    { name: 'Peaceful PG', address: 'Arilova', city: 'Visakhapatnam', monthlyRent: 6500, genderPreference: 'COED', roomType: 'SINGLE', facilities: JSON.stringify(['WiFi']), foodAvailable: false, distance: 3.4, rating: 4.0, isVerified: 'PENDING', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']) },
    { name: 'Seawinds PG', address: 'East Point Colony', city: 'Visakhapatnam', monthlyRent: 6000, genderPreference: 'BOYS', roomType: 'DOUBLE', facilities: JSON.stringify(['WiFi', 'AC']), foodAvailable: false, distance: 0.8, rating: 4.7, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']) },
    { name: 'ALTOP PG', address: 'Dwarakanagar', city: 'Visakhapatnam', monthlyRent: 7500, genderPreference: 'BOYS', roomType: 'DOUBLE', facilities: JSON.stringify(['AC', 'WiFi']), foodAvailable: false, distance: 1.3, rating: 4.5, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55dd1b31120?w=800']) },
    { name: 'Somuvijaya PG', address: 'East Point Colony', city: 'Visakhapatnam', monthlyRent: 7000, genderPreference: 'GIRLS', roomType: 'DOUBLE', facilities: JSON.stringify(['WiFi']), foodAvailable: false, distance: 0.7, rating: 4.2, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']) },
    { name: 'Sheelanagar Single Room', address: 'Sheelanagar', city: 'Visakhapatnam', monthlyRent: 7000, genderPreference: 'COED', roomType: 'SINGLE', facilities: JSON.stringify(['WiFi', 'AC']), foodAvailable: false, distance: 4.5, rating: 4.1, isVerified: 'PENDING', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']) },
    { name: 'Unique Ladies Hostel', address: 'RTC Complex', city: 'Visakhapatnam', monthlyRent: 6500, genderPreference: 'GIRLS', roomType: 'TRIPLE', facilities: JSON.stringify(['Meals', 'WiFi', 'Security']), foodAvailable: true, distance: 0.2, rating: 4.8, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55dd1b31120?w=800']) },
    { name: 'Simhachalam Co-living', address: 'Simhachalam', city: 'Visakhapatnam', monthlyRent: 6500, genderPreference: 'COED', roomType: 'DOUBLE', facilities: JSON.stringify(['WiFi', 'AC']), foodAvailable: false, distance: 6.0, rating: 4.3, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']) },
    { name: 'Kashi Annapuram Boys PG', address: 'Sri Nagar', city: 'Visakhapatnam', monthlyRent: 7800, genderPreference: 'BOYS', roomType: 'TRIPLE', facilities: JSON.stringify(['Meals', 'WiFi', 'AC']), foodAvailable: true, distance: 1.0, rating: 4.5, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']) },
    { name: 'Hotel Sai Nivas PG', address: 'Visakhapatnam', city: 'Visakhapatnam', monthlyRent: 10000, genderPreference: 'COED', roomType: 'DOUBLE', facilities: JSON.stringify(['AC', 'WiFi', 'Power Backup']), foodAvailable: false, distance: 1.4, rating: 4.6, isVerified: 'VERIFIED', ownerId: owner.id, images: JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55dd1b31120?w=800']) }
  ];

  for (const p of dataset) {
    await prisma.property.create({ data: p });
  }

  console.log('Seeded Dataset 2 properties!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
EOF

echo "Done writing Phase 4 components."
