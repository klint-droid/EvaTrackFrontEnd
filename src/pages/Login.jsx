import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  Award,
  IdCard,
  Smartphone,
  Mail,
  CheckCircle2,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import API from "../api";
import placeImage from "../assets/place.png";
import evaTrackLogo from "../assets/evatrack_logo_stacked.svg";
import { useUserStore } from "../store/useUserStore";
import { Input } from "../ui/Input";

function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Forgot Password multi-step state
  // mode: 'login' | 'forgot'
  // step: 1 (lookup) | 2 (choose channel) | 3 (verify otp) | 4 (reset password)
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [accountInfo, setAccountInfo] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState("sms");
  const [destinationMasked, setDestinationMasked] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpInputRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const openForgotPassword = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIdentifier(userId.trim());
    setAccountInfo(null);
    setOtpDigits(["", "", "", "", "", ""]);
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setStep(1);
    setMode("forgot");
  };

  const backToLogin = () => {
    setError("");
    setMode("login");
    setStep(1);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId.trim() || !password.trim()) {
      setError("Please enter both User ID and Password.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await API.get("/sanctum/csrf-cookie");

      const response = await API.post("/api/login", {
        user_id: userId,
        password,
      });

      localStorage.setItem("token", response.data.token);
      const loggedInUser = response.data.user;
      useUserStore.getState().setUser(loggedInUser);

      if (loggedInUser?.role === "super_admin") {
        navigate("/user-management");
      } else {
        navigate("/dashboard");
      }
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

  // Step 1: Lookup user account by User ID, Mobile Number, or Email
  const handleLookupAccount = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your Official User ID, mobile number, or email.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await API.post("/api/forgot-password/lookup", {
        identifier: identifier.trim(),
      });
      const data = res.data;
      setAccountInfo(data);
      if (data.has_mobile) {
        setSelectedChannel("sms");
      } else if (data.has_email) {
        setSelectedChannel("email");
      }
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not find an account matching that information."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Send 6-Digit OTP via chosen channel (sms or email)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!accountInfo?.user_id) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await API.post("/api/forgot-password/send-otp", {
        user_id: accountInfo.user_id,
        channel: selectedChannel,
      });

      setDestinationMasked(
        res.data?.destination_masked ||
          (selectedChannel === "sms"
            ? accountInfo.masked_mobile
            : accountInfo.masked_email)
      );
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCooldown(60);
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Box Input Handlers
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  // Step 3: Verify 6-Digit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await API.post("/api/forgot-password/verify-otp", {
        user_id: accountInfo.user_id,
        otp: otpCode,
      });

      setResetToken(res.data.reset_token);
      setStep(4);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired OTP code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await API.post("/api/forgot-password/reset", {
        user_id: accountInfo.user_id,
        reset_token: resetToken,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      setUserId(accountInfo.user_id);
      setPassword("");
      setSuccessMessage(
        res.data?.message ||
          "Password reset successfully! You can now sign in with your new password."
      );
      setMode("login");
      setStep(1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FC] font-sans overflow-hidden">
      {/* ── LEFT COLUMN: SIGN IN / FORGOT PASSWORD FORM ── */}
      <section className="w-full md:w-[45%] lg:w-[40%] xl:w-[35%] flex flex-col justify-between bg-white dark:bg-slate-900 px-6 sm:px-10 py-10 shadow-2xl z-10 relative">
        {/* Top Header Row */}
        <div className="flex items-center justify-start">
          {mode === "forgot" ? (
            <button
              type="button"
              onClick={backToLogin}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors uppercase tracking-wider group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
              Back to Sign In
            </button>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 transition-colors uppercase tracking-wider group"
            >
              <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:text-slate-200" />
              Portal
            </Link>
          )}
        </div>

        {/* Form Container */}
        <div className="my-auto py-10 max-w-[360px] w-full mx-auto">
          {mode === "login" ? (
            <>
              {/* Header */}
              <div className="mb-8 text-left">
                <h1 className="text-3.5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                  Sign In
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-[2px] w-6 bg-blue-600 dark:bg-blue-400 rounded"></div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                    Official Personnel Access
                  </span>
                </div>
              </div>

              {/* Success Message Box */}
              {successMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Message Box */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-rose-950/50 dark:border-rose-800 p-4 text-xs font-semibold text-red-700 dark:text-rose-300 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleLogin} className="space-y-5 text-left">
                <Input
                  id="userId"
                  label="Official User ID"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="EVA-BRGY-01"
                  icon={IdCard}
                />

                <div>
                  <Input
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    icon={Lock}
                    rightAction={
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="text-slate-400 transition hover:text-slate-700 dark:text-slate-200 focus:outline-none"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5" />
                        )}
                      </button>
                    }
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-start pt-1">
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 dark:shadow-none transition-all active:scale-[0.98] ${
                      isLoading
                        ? "cursor-not-allowed bg-blue-600/70"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing In...
                      </span>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* ── FORGOT PASSWORD MULTI-STEP FLOW ── */
            <div className="animate-in fade-in duration-200 text-left">
              {/* Step Indicator */}
              <div className="flex items-center gap-1.5 mb-5">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      s <= step
                        ? "bg-blue-600 dark:bg-blue-500"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                  {step === 1 && "Forgot Password"}
                  {step === 2 && "Select OTP Channel"}
                  {step === 3 && "Verify OTP Code"}
                  {step === 4 && "Create New Password"}
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {step === 1 &&
                    "Enter your Official User ID, registered mobile number, or email address to locate your account."}
                  {step === 2 &&
                    "Choose how you want to receive your 6-digit verification code."}
                  {step === 3 &&
                    `Enter the 6-digit code sent to ${destinationMasked}.`}
                  {step === 4 &&
                    "Choose a strong new password (at least 8 characters) for your account."}
                </p>
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-rose-950/50 dark:border-rose-800 p-3.5 text-xs font-semibold text-red-700 dark:text-rose-300 animate-in fade-in duration-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: ACCOUNT LOOKUP */}
              {step === 1 && (
                <form onSubmit={handleLookupAccount} className="space-y-5">
                  <Input
                    id="identifier"
                    label="User ID, Mobile Number, or Email"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. EAD-2026-ADMIN1 or 09123456789"
                    icon={IdCard}
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    {isLoading ? "Searching Account..." : "Continue"}
                  </button>
                </form>
              )}

              {/* STEP 2: SELECT MOBILE OTP OR EMAIL OTP */}
              {step === 2 && accountInfo && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Matched Account Pill */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {accountInfo.name}
                      </p>
                      <p className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                        {accountInfo.user_id}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setStep(1);
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Channel Options */}
                  <div className="space-y-2.5">
                    {/* Mobile SMS Option */}
                    <button
                      type="button"
                      disabled={!accountInfo.has_mobile}
                      onClick={() => setSelectedChannel("sms")}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        !accountInfo.has_mobile
                          ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                          : selectedChannel === "sms"
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20 cursor-pointer"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-lg ${
                          selectedChannel === "sms" && accountInfo.has_mobile
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        <Smartphone size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Mobile OTP (SMS)
                          </span>
                          {!accountInfo.has_mobile && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                              Not Linked
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {accountInfo.has_mobile
                            ? `Send code to ${accountInfo.masked_mobile}`
                            : "No mobile number on this account"}
                        </p>
                      </div>
                    </button>

                    {/* Email Option */}
                    <button
                      type="button"
                      disabled={!accountInfo.has_email}
                      onClick={() => setSelectedChannel("email")}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        !accountInfo.has_email
                          ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                          : selectedChannel === "email"
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20 cursor-pointer"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-lg ${
                          selectedChannel === "email" && accountInfo.has_email
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        <Mail size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Email OTP
                          </span>
                          {!accountInfo.has_email && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                              Not Linked
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {accountInfo.has_email
                            ? `Send code to ${accountInfo.masked_email}`
                            : "No email address on this account"}
                        </p>
                      </div>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer mt-2"
                  >
                    {isLoading ? "Sending OTP Code..." : "Send 6-Digit OTP"}
                  </button>
                </form>
              )}

              {/* STEP 3: VERIFY 6-DIGIT OTP */}
              {step === 3 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div
                    className="grid grid-cols-6 gap-2"
                    onPaste={handleOtpPaste}
                  >
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="h-12 w-full text-center text-lg font-extrabold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setStep(2);
                      }}
                      className="font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Change channel
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={handleSendOtp}
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={12} />
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend OTP"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpDigits.join("").length !== 6}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </button>
                </form>
              )}

              {/* STEP 4: SET NEW PASSWORD */}
              {step === 4 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <Input
                    id="newPassword"
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    icon={KeyRound}
                    rightAction={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                  />

                  <Input
                    id="confirmPassword"
                    label="Confirm New Password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    icon={Lock}
                    rightAction={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer mt-2"
                  >
                    {isLoading ? "Updating Password..." : "Reset Password"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom Secured Footer */}
        <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
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
        <img
          src={placeImage}
          alt="Backdrop image showing crisis planning location"
          className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none mix-blend-luminosity z-0"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-slate-950/20 pointer-events-none z-10" />

        <div className="relative max-w-[480px] w-full text-center flex flex-col items-center z-20">
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
              Ensuring real-time response and resource transparency across
              evacuation centers. EvaTrack centralizes multi-agency data to
              protect communities during critical environmental events.
            </p>

            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-wider text-sky-300 mt-6">
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
