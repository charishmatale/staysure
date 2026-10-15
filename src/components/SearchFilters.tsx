"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Filter, RotateCcw, Check, ShieldCheck } from "lucide-react";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State initialization from URL params
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [budget, setBudget] = useState(searchParams.get("budget") || "30000");
  const [sort, setSort] = useState(searchParams.get("sort") || "popular");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [foodOnly, setFoodOnly] = useState(searchParams.get("food") === "true");

  // Checkbox arrays
  const [selectedGenders, setSelectedGenders] = useState<string[]>(
    searchParams.get("gender") ? searchParams.get("gender")!.split(",").filter(Boolean) : []
  );

  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>(
    searchParams.get("roomType") ? searchParams.get("roomType")!.split(",").filter(Boolean) : []
  );

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
    searchParams.get("facility") ? searchParams.get("facility")!.split(",").filter(Boolean) : []
  );

  const toggleGender = (val: string) => {
    setSelectedGenders(prev =>
      prev.includes(val) ? prev.filter(g => g !== val) : [...prev, val]
    );
  };

  const toggleRoomType = (val: string) => {
    setSelectedRoomTypes(prev =>
      prev.includes(val) ? prev.filter(r => r !== val) : [...prev, val]
    );
  };

  const toggleFacility = (val: string) => {
    setSelectedFacilities(prev =>
      prev.includes(val) ? prev.filter(f => f !== val) : [...prev, val]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (budget) params.set("budget", budget);
    if (sort) params.set("sort", sort);
    if (verifiedOnly) params.set("verified", "true");
    if (foodOnly) params.set("food", "true");
    if (selectedGenders.length > 0) params.set("gender", selectedGenders.join(","));
    if (selectedRoomTypes.length > 0) params.set("roomType", selectedRoomTypes.join(","));
    if (selectedFacilities.length > 0) params.set("facility", selectedFacilities.join(","));
    
    router.push(`/search?${params.toString()}`);
  };

  const resetFilters = () => {
    setArea("");
    setBudget("30000");
    setSort("popular");
    setVerifiedOnly(false);
    setFoodOnly(false);
    setSelectedGenders([]);
    setSelectedRoomTypes([]);
    setSelectedFacilities([]);
    router.push("/search");
  };

  const areasList = [
    "Yendada", "Ram Nagar", "Maharani Peta", "Chinna Waltair", "Mindi",
    "Shivaji Palem", "Kurmannapalem", "Sagar Nagar", "Rushikonda", "M.V. Palem",
    "Sri Nagar", "Arilova", "East Point Colony", "Dwarakanagar", "Sheelanagar",
    "RTC Complex", "Simhachalam", "Narasimha Nagar", "MVP Colony", "Daba Gardens"
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 sticky top-24 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Filter size={20} className="text-teal-600 dark:text-teal-400" /> Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-xs text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 font-semibold transition"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/60 focus:ring-2 focus:ring-teal-500 outline-none transition"
        >
          <option value="popular">🔥 Popular PGs (Top Rated)</option>
          <option value="price_asc">💰 Price: Low to High</option>
          <option value="price_desc">💎 Price: High to Low</option>
        </select>
      </div>

      {/* Area / Location Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Area / Location
        </label>
        <select 
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/60 focus:ring-2 focus:ring-teal-500 outline-none transition" 
        >
          <option value="">All Locations</option>
          {areasList.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Max Budget Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Max Budget
          </label>
          <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
            ₹{Number(budget).toLocaleString()}
          </span>
        </div>
        <input 
          type="range" 
          min="1000" max="30000" step="500"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full accent-teal-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
          <span>₹1k</span>
          <span>₹15k</span>
          <span>₹30k</span>
        </div>
      </div>

      {/* Checkbox Filter: Gender Preference */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
          Gender Preference
        </label>
        <div className="space-y-2">
          {[
            { id: "BOYS", label: "Boys PG / Hostel" },
            { id: "GIRLS", label: "Girls PG / Hostel" },
            { id: "COED", label: "Co-ed" }
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition"
            >
              <input
                type="checkbox"
                checked={selectedGenders.includes(item.id)}
                onChange={() => toggleGender(item.id)}
                className="w-4 h-4 rounded text-teal-600 border-slate-300 dark:border-slate-600 focus:ring-teal-500 accent-teal-600"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Checkbox Filter: Room Type */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
          Room Sharing Type
        </label>
        <div className="space-y-2">
          {[
            { id: "SINGLE", label: "Single Room" },
            { id: "DOUBLE", label: "Twin / Double Sharing" },
            { id: "TRIPLE", label: "Triple Sharing" }
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition"
            >
              <input
                type="checkbox"
                checked={selectedRoomTypes.includes(item.id)}
                onChange={() => toggleRoomType(item.id)}
                className="w-4 h-4 rounded text-teal-600 border-slate-300 dark:border-slate-600 focus:ring-teal-500 accent-teal-600"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Checkbox Filter: Facilities & Amenities */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
          Facilities & Amenities
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {[
            { id: "WiFi", label: "Wi-Fi Internet" },
            { id: "AC", label: "Air Conditioning (AC)" },
            { id: "Meals", label: "Food / Meals" },
            { id: "Laundry", label: "Laundry Service" },
            { id: "Power Backup", label: "Power Backup" },
            { id: "TV", label: "Television (TV)" },
            { id: "Security", label: "CCTV / Security" },
            { id: "Parking", label: "Two-Wheeler Parking" }
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition"
            >
              <input
                type="checkbox"
                checked={selectedFacilities.includes(item.id)}
                onChange={() => toggleFacility(item.id)}
                className="w-4 h-4 rounded text-teal-600 border-slate-300 dark:border-slate-600 focus:ring-teal-500 accent-teal-600"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Checkbox Filter: Verification & Food Status */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
        <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 border-slate-300 dark:border-slate-600 focus:ring-teal-500 accent-teal-600"
          />
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-green-500" /> Verified PGs Only
          </span>
        </label>

        <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition">
          <input
            type="checkbox"
            checked={foodOnly}
            onChange={(e) => setFoodOnly(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 border-slate-300 dark:border-slate-600 focus:ring-teal-500 accent-teal-600"
          />
          <span>Food / Mess Included</span>
        </label>
      </div>

      <button 
        onClick={applyFilters} 
        className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg text-sm"
      >
        Apply Filtered Search
      </button>
    </div>
  );
}
