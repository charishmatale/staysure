"use client";

import { useState } from "react";
import { Plus, X, Sparkles, Building2, CheckCircle2 } from "lucide-react";

export default function AddPropertyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("Yendada");
  const [monthlyRent, setMonthlyRent] = useState("7000");
  const [genderPreference, setGenderPreference] = useState("COED");
  const [roomType, setRoomType] = useState("DOUBLE");
  const [foodAvailable, setFoodAvailable] = useState(true);
  const [distance, setDistance] = useState("1.0");
  const [facilities, setFacilities] = useState<string[]>(["WiFi", "AC", "Meals", "Power Backup"]);

  const toggleFacility = (f: string) => {
    setFacilities(prev =>
      prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          city: "Visakhapatnam",
          monthlyRent,
          genderPreference,
          roomType,
          foodAvailable,
          distance,
          facilities
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create property");

      setSuccessMsg("Property added successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSamples = async () => {
    setSeedLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_samples" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add sample properties");

      setSuccessMsg("Sample listings added to your account!");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add sample properties");
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Add New PG Listing
        </button>

        <button
          onClick={handleSeedSamples}
          disabled={seedLoading}
          className="bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles size={16} className="text-amber-500" />
          {seedLoading ? "Adding Samples..." : "Quick Load 3 Sample Listings"}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-100 dark:border-slate-700 relative my-8">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-2xl">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Add New PG / Hostel</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">List your property for students</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Property Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Balaji Luxury PG"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Area / Location *
                  </label>
                  <select
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Yendada">Yendada</option>
                    <option value="MVP Colony">MVP Colony</option>
                    <option value="Ram Nagar">Ram Nagar</option>
                    <option value="Maharani Peta">Maharani Peta</option>
                    <option value="Rushikonda">Rushikonda</option>
                    <option value="Dwarakanagar">Dwarakanagar</option>
                    <option value="Arilova">Arilova</option>
                    <option value="Sagar Nagar">Sagar Nagar</option>
                    <option value="Chinna Waltair">Chinna Waltair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 7500"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Gender Preference
                  </label>
                  <select
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="BOYS">Boys Only</option>
                    <option value="GIRLS">Girls Only</option>
                    <option value="COED">Co-ed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Room Sharing Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="SINGLE">Single Room</option>
                    <option value="DOUBLE">Twin / Double Sharing</option>
                    <option value="TRIPLE">Triple Sharing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Distance to College (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={foodAvailable}
                      onChange={(e) => setFoodAvailable(e.target.checked)}
                      className="w-4 h-4 text-teal-600 accent-teal-600"
                    />
                    <span>Food / Mess Included</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">
                  Facilities (Check all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["WiFi", "AC", "Meals", "Laundry", "Power Backup", "TV", "Security", "Parking"].map((fac) => (
                    <label
                      key={fac}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={facilities.includes(fac)}
                        onChange={() => toggleFacility(fac)}
                        className="text-teal-600 accent-teal-600"
                      />
                      <span className="text-slate-800 dark:text-slate-200">{fac}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-md disabled:opacity-50"
                >
                  {loading ? "Publishing..." : "Publish PG Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
