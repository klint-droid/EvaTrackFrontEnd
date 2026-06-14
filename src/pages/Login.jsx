import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck, Lock, Mail, Globe, Award } from "lucide-react";
import API from "../api";
import placeImage from "../assets/place.png";
import evaTrackLogo from "../assets/evatrack_logo_stacked.svg";

function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId.trim() || !password.trim()) {
      setError("Please enter both User ID and Password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await API.get("/sanctum/csrf-cookie");

      const response = await API.post("/api/login", {
        user_id: userId,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Invalid User ID or Password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FC] font-sans overflow-hidden">
      
      {/* ── LEFT COLUMN: SIGN IN FORM ── */}
      <section className="w-full md:w-[45%] lg:w-[40%] xl:w-[35%] flex flex-col justify-between bg-white px-6 sm:px-10 py-10 shadow-2xl z-10 relative">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-start">
          {/* Portal Link */}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider group"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            Portal
          </Link>
        </div>

        {/* Form Container */}
        <div className="my-auto py-10 max-w-[360px] w-full mx-auto">
          {/* Header */}
          <div className="mb-8 text-left">
            <h1 className="text-3.5xl font-extrabold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-[2px] w-6 bg-[#0B1530] rounded"></div>
              <span className="text-xs font-semibold text-slate-500 tracking-wide">
                Official Personnel Access
              </span>
            </div>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            {/* User ID Field */}
            <div>
              <label htmlFor="userId" className="block text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Official User ID
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="block h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 text-left"
                  placeholder="j.delacruz@gov.ph"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 text-left"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 transition hover:text-slate-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-[#0B1530] focus:ring-[#0B1530] transition cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-700 transition">
                  Remember my terminal
                </span>
              </label>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact your municipal system administrator to reset credentials.");
                }} 
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                  isLoading
                    ? "cursor-not-allowed bg-[#0B1530]/70"
                    : "bg-[#0B1530] hover:bg-slate-800 shadow-slate-900/10 focus:outline-none focus:ring-4 focus:ring-slate-200"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In to Command
                    <span className="text-lg">→</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Secured Footer */}
        <div className="text-center pt-8 border-t border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Secured by Barangay Disaster Management Authority
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <ShieldCheck size={16} />
            <Lock size={15} />
            <Award size={16} />
          </div>
        </div>

      </section>

      {/* ── RIGHT COLUMN: BACKDROP IMAGE AND METRICS OVERLAY ── */}
      <section className="hidden md:flex md:w-[55%] lg:w-[60%] xl:w-[65%] bg-[#081424] relative overflow-hidden items-center justify-center p-12 lg:p-20 select-none">
        
        {/* Background Image of coastal area */}
        <img
          src={placeImage}
          alt="Backdrop image showing crisis planning location"
          className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none mix-blend-luminosity z-0"
        />

        {/* Smooth Dark Gradient Overlays for maximum text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-slate-950/20 pointer-events-none z-10" />

        {/* Content Container */}
        <div className="relative max-w-[480px] w-full text-center flex flex-col items-center z-20">
          
          {/* Centered Logo Card */}
          <div className="bg-slate-950/60 border border-white/[0.08] backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center w-full transform hover:scale-[1.01] transition-transform duration-500">
            
            <img
              src={evaTrackLogo}
              alt="EvaTrack logo"
              className="h-28 w-auto object-contain mb-1"
            />
            
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">
              Barangay Evacuation System
            </span>
            
            <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-5" />

            <p className="text-slate-300 text-[13px] leading-relaxed font-semibold">
              Ensuring real-time response and resource transparency across evacuation centers.
              EvaTrack centralizes multi-agency data to protect communities during critical environmental events.
            </p>

            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-wider text-sky-300 mt-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500" />
              </span>
              Barangay Level Disaster Coordination
            </div>

          </div>
        </div>

      </section>

    </main>
  );
}

export default Login;
