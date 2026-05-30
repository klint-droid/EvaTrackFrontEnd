import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck, Activity, Users, User, Lock, Film } from "lucide-react";
import API from "../api";
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
    <main className="relative min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden">
      
      {/* ── LEFT COLUMN: LOGIN INPUTS ── */}
      <section className="w-full md:w-[45%] lg:w-[40%] xl:w-[35%] flex flex-col justify-between bg-white px-6 sm:px-12 py-10 shadow-xl z-10 relative">
        <div className="flex items-center justify-between md:justify-start">
          {/* Logo visible on mobile only */}
          <div className="flex md:hidden items-center gap-2">
            <img
              src={evaTrackLogo}
              alt="EvaTrack logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            Portal
          </Link>
        </div>

        <div className="my-auto py-8 max-w-[420px] w-full mx-auto">
          {/* Header */}
          <div className="mb-8 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              <ShieldCheck size={12} />
              Secure Authorization
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight !m-0 text-left">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed text-left">
              Access the EvaTrack Crisis Operations Dashboard. Authorized personnel credentials required.
            </p>
          </div>

          {/* Alert Error Box */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label htmlFor="userId" className="block text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                User ID
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="block h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-left"
                  placeholder="Enter your User ID"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Password
                </label>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-left"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 transition hover:text-slate-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex h-12 w-full items-center justify-center rounded-xl px-4 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] ${
                  isLoading
                    ? "cursor-not-allowed bg-blue-600/70"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/10 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying Identity...
                  </span>
                ) : (
                  "Access Terminal"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            &copy; {new Date().getFullYear()} EvaTrack Systems. All rights reserved.
          </p>
        </div>
      </section>

      {/* ── RIGHT COLUMN: LOGO, BRANDING & VIDEO BACKDROP ── */}
      <section className="hidden md:flex md:w-[55%] lg:w-[60%] xl:w-[65%] bg-[#081424] relative overflow-hidden items-center justify-center p-12 lg:p-20 select-none">
        
        {/* Background Graphic Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,transparent_70%)] blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_70%)] blur-3xl pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.02),transparent_60%)] pointer-events-none z-0" />

        {/* Ambient Dark Overlay to protect text legibility */}
        <div className="absolute inset-0 bg-slate-950/40 pointer-events-none z-10" />

        {/* Background Video Player */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none mix-blend-screen z-0"
        >
          {/* User's planned custom video */}
          <source src="/src/assets/login_bg.mp4" type="video/mp4" />
          {/* Premium fallback abstract sci-fi/data network visual */}
          <source src="https://assets.mixkit.co/videos/preview/mixkit-hud-interface-screens-and-data-nodes-32863-large.mp4" type="video/mp4" />
        </video>

        <div className="relative max-w-[620px] text-center flex flex-col items-center z-20">
          
          {/* Logo Card */}
          <div className="bg-slate-950/60 border border-slate-800/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center max-w-[480px] w-full transform hover:scale-[1.01] transition-transform duration-500">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
              <Activity className="text-white w-10 h-10 animate-pulse" />
            </div>
            
            <img
              src={evaTrackLogo}
              alt="EvaTrack logo"
              className="h-32 w-auto object-contain mb-2"
            />
            
            <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4" />
            
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-wider text-sky-300">
              <Film size={10} className="animate-spin duration-3000" />
              Live Visual Feed Active
            </div>
          </div>

          {/* Quick Metrics Overlay Info */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-[480px] mt-8">
            <div className="bg-slate-950/40 border border-slate-900/60 p-4 rounded-2xl text-left backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1.5">
                <Users size={16} className="text-blue-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Demographic Flow</span>
              </div>
              <p className="text-[11px] text-sky-200/70 font-semibold leading-relaxed">
                Aggregating real-time vulnerability indices & age profiles.
              </p>
            </div>
            
            <div className="bg-slate-900/25 border border-slate-800/40 p-4 rounded-2xl text-left backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1.5">
                <Activity size={16} className="text-emerald-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Capacity Ratios</span>
              </div>
              <p className="text-[11px] text-sky-200/70 font-semibold leading-relaxed">
                Monitoring critical load benchmarks for active shelters.
              </p>
            </div>
          </div>

        </div>

      </section>

    </main>
  );
}

export default Login;
