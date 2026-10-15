"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Building2, User, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [tab, setTab] = useState<"STUDENT" | "OWNER">("STUDENT");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTabChange = (newTab: "STUDENT" | "OWNER") => {
    setTab(newTab);
    setError("");
    setSuccess("");
  };

  const handleModeChange = (mode: boolean) => {
    setIsLogin(mode);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (!isLogin) {
        // Registering a new account
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: cleanEmail,
            password,
            role: tab
          })
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed. Please try again.");
          setLoading(false);
          return;
        }

        setSuccess(`Account registered successfully as a ${tab === "STUDENT" ? "Student" : "PG Owner"}! Signing you in...`);
      }

      // Sign in with credentials + tab role validation
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        role: tab,
        redirect: false
      });

      if (res?.error) {
        if (res.error === "ACCOUNT_NOT_FOUND") {
          setError("No account found with this email. You must register first by clicking 'Create New Account' above.");
        } else if (res.error === "INCORRECT_PASSWORD") {
          setError("Incorrect password. Please verify your password and try again.");
        } else if (res.error === "ROLE_IS_STUDENT") {
          setError("This email is registered as a Student. Please switch to the 'Student Access' tab above to log in.");
        } else if (res.error === "ROLE_IS_OWNER") {
          setError("This email is registered as a PG Owner. Please switch to the 'PG Owner Access' tab above to log in.");
        } else if (res.error.includes("ROLE") || res.error.includes("tab")) {
          setError(res.error);
        } else {
          setError("Invalid credentials. If you haven't registered yet, please click 'Create New Account' above.");
        }
        setLoading(false);
      } else {
        // Successful login
        if (tab === "OWNER") {
          router.push("/owner/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-teal-600 dark:text-teal-400 tracking-tight">StaySure</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified PG & Hostel Accommodation</p>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-700/70 p-1.5 rounded-2xl mb-6">
          <button 
            type="button"
            onClick={() => handleTabChange("STUDENT")} 
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === "STUDENT" 
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-md" 
                : "text-slate-500 dark:text-slate-300 hover:text-slate-800"
            }`}
          >
            <GraduationCap size={16} /> Student Access
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange("OWNER")} 
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === "OWNER" 
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-md" 
                : "text-slate-500 dark:text-slate-300 hover:text-slate-800"
            }`}
          >
            <Building2 size={16} /> PG Owner Access
          </button>
        </div>

        {/* Mode Toggle: Sign In vs Register */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
          <button
            type="button"
            onClick={() => handleModeChange(true)}
            className={`flex-1 pb-3 text-sm font-bold transition border-b-2 ${
              isLogin 
                ? "border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeChange(false)}
            className={`flex-1 pb-3 text-sm font-bold transition border-b-2 ${
              !isLogin 
                ? "border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Notice on Role */}
        <div className="mb-6 p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-xs text-teal-800 dark:text-teal-300">
          {tab === "STUDENT" ? (
            <span>🎓 <strong>Student Portal</strong>: Search verified PGs, read reviews, and request room bookings.</span>
          ) : (
            <span>🏢 <strong>PG Owner Portal</strong>: List your hostels and manage incoming student booking requests.</span>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-300 p-3.5 rounded-xl mb-4 text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-300 p-3.5 rounded-xl mb-4 text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/60 focus:ring-2 focus:ring-teal-500 outline-none text-sm transition" 
                  placeholder={tab === "STUDENT" ? "e.g. Rahul Sharma" : "e.g. Suresh Kumar (PG Owner)"}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/60 focus:ring-2 focus:ring-teal-500 outline-none text-sm transition" 
                placeholder="youremail@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/60 focus:ring-2 focus:ring-teal-500 outline-none text-sm transition" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold transition disabled:opacity-50 shadow-lg text-sm mt-6 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : (isLogin ? `Sign In as ${tab === "STUDENT" ? "Student" : "PG Owner"}` : `Register as ${tab === "STUDENT" ? "Student" : "PG Owner"}`)}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          {isLogin ? (
            <p>
              New to StaySure?{" "}
              <button 
                type="button" 
                onClick={() => handleModeChange(false)} 
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
              >
                Register an account here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button 
                type="button" 
                onClick={() => handleModeChange(true)} 
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
              >
                Sign in to your account
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
