import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d1a2a] px-5 py-10 text-left">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#111f32]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_34%)]" />

      <section className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] bg-[#081524] shadow-2xl">
        <div className="flex justify-center bg-[#162438] px-8 py-7">
          <img
            src={evaTrackLogo}
            alt="EvaTrack logo"
            className="h-40 w-72 object-contain"
          />
        </div>

        <div className="px-8 pb-9 pt-6 sm:px-10">
          <div className="mx-auto mb-3 h-0.5 w-28 bg-blue-500" />
          <h2 className="!m-0 text-center text-3xl font-black tracking-normal !text-white">
            Login
          </h2>
          <p className="mx-auto mt-2 max-w-72 text-center text-sm leading-5 text-sky-200">
            Sign in to access the EvacConnect admin dashboard
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-300" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-7 space-y-5">
            <div>
              <label htmlFor="userId" className="block text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
                User ID
              </label>
              <div className="mt-1">
                <input
                  id="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="block h-14 w-full rounded-xl border border-transparent bg-[#1a3047] px-5 text-sm font-medium text-white outline-none transition placeholder:text-sky-200/35 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                  placeholder="User ID"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block h-14 w-full rounded-xl border border-transparent bg-[#1a3047] px-5 pr-14 text-sm font-medium text-white outline-none transition placeholder:text-sky-200/45 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                  placeholder="........"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-4 flex items-center text-sky-200/60 transition hover:text-sky-100 focus:outline-none"
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
                className={`flex h-14 w-full items-center justify-center rounded-2xl px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/25 transition ${
                  isLoading
                    ? "cursor-not-allowed bg-blue-500/70"
                    : "bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#081524]"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-sky-200 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Public Portal
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Login;
