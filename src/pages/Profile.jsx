import { useState, useEffect } from "react";
import { 
    User, Lock, Shield, Phone, Building, Save, Key, Loader2, Sparkles, MapPin, CheckCircle2, AlertCircle 
} from "lucide-react";
import { getUser } from "../api/auth/getUser";
import { updateProfile } from "../api/auth/updateProfile";
import { updatePassword } from "../api/auth/updatePassword";

export default function Profile() {
    const [activeTab, setActiveTab] = useState("info"); // "info" or "security"
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // Profile details state
    const [profileData, setProfileData] = useState({
        user_id: "",
        first_name: "",
        last_name: "",
        contact_number: "",
        role: "",
        role_label: "",
        assigned_center: null
    });

    // Password fields state
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
    });

    const showMessage = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const res = await getUser();
            const rawUser = res.data || res;
            
            setProfileData({
                user_id: rawUser.user_id || "",
                first_name: rawUser.first_name || "",
                last_name: rawUser.last_name || "",
                contact_number: rawUser.contact_number || "",
                role: rawUser.role?.role_key || "",
                role_label: rawUser.role?.role_name || "",
                assigned_center: rawUser.assigned_center || rawUser.assignedCenter || null
            });
        } catch (err) {
            console.error(err);
            showMessage("Failed to load user profile.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        if (!profileData.first_name.trim() || !profileData.last_name.trim()) {
            showMessage("First name and last name are required.", "error");
            return;
        }

        if (!profileData.contact_number.trim()) {
            showMessage("Contact number is required.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const res = await updateProfile({
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                contact_number: profileData.contact_number
            });

            const updatedUser = res.data?.user || res.user;

            // Sync with local storage user representation
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const newStoredUser = {
                ...storedUser,
                name: updatedUser.name
            };
            localStorage.setItem("user", JSON.stringify(newStoredUser));

            // Update local state
            setProfileData(prev => ({
                ...prev,
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                contact_number: updatedUser.contact_number
            }));

            showMessage("Profile details updated successfully.");
            
            // Dispatch custom event to tell topbar to update user name
            window.dispatchEvent(new Event("storage"));
        } catch (err) {
            const errMsg = err.response?.data?.message || "Failed to update profile details.";
            showMessage(errMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        if (!passwordData.current_password) {
            showMessage("Current password is required.", "error");
            return;
        }

        if (passwordData.new_password.length < 8) {
            showMessage("New password must be at least 8 characters long.", "error");
            return;
        }

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            showMessage("New passwords do not match.", "error");
            return;
        }

        setSubmitting(true);
        try {
            await updatePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
                new_password_confirmation: passwordData.new_password_confirmation
            });

            setPasswordData({
                current_password: "",
                new_password: "",
                new_password_confirmation: ""
            });

            showMessage("Password updated successfully.");
        } catch (err) {
            const errMsg = err.response?.data?.message || "Failed to update password.";
            showMessage(errMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Profile...</p>
            </div>
        );
    }

    const initials = `${profileData.first_name?.[0] || ""}${profileData.last_name?.[0] || ""}`.toUpperCase();

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="text-blue-600" size={24} />
                    My Account Profile
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">
                    Manage and secure your personal account details
                </p>
            </div>

            {/* Notification Alert */}
            {message && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border animate-in zoom-in-95 duration-200 ${
                    message.type === "error" 
                        ? "bg-red-50 border-red-100 text-red-700" 
                        : "bg-emerald-50 border-emerald-100 text-emerald-700"
                }`}>
                    {message.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    <span className="text-xs font-black uppercase tracking-wide">{message.text}</span>
                </div>
            )}

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Card: Summary */}
                <div className="md:col-span-1 bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col items-center justify-between text-center min-h-[350px]">
                    <div className="space-y-4 w-full flex flex-col items-center">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-blue-500/20">
                            {initials || <User size={40} />}
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-slate-800 leading-snug">
                                {profileData.first_name} {profileData.last_name}
                            </h3>
                            <span className="inline-block mt-1 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                {profileData.role_label || profileData.role || "Operator"}
                            </span>
                        </div>
                    </div>

                    <div className="w-full border-t border-slate-100 pt-5 space-y-3.5 text-left">
                        {/* Details */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                <Shield size={14} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">User Identifier</p>
                                <p className="text-xs font-bold text-slate-700 font-mono select-all">{profileData.user_id}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                <Building size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Duty Station Assignment</p>
                                <p className="text-xs font-bold text-slate-700 truncate">
                                    {profileData.assigned_center?.name || "No assigned center"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Card: Editor and Tabs */}
                <div className="md:col-span-2 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm flex flex-col overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === "info"
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <User size={13} />
                            Profile Details
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === "security"
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <Lock size={13} />
                            Security
                        </button>
                    </div>

                    {/* Tab Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                        {activeTab === "info" && (
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
                                        <input
                                            value={profileData.first_name}
                                            onChange={e => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
                                        <input
                                            value={profileData.last_name}
                                            onChange={e => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            value={profileData.contact_number}
                                            onChange={e => setProfileData(prev => ({ ...prev, contact_number: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. 09123456789"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg shadow-blue-600/20 uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === "security" && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={e => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
                                        <div className="relative">
                                            <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="password"
                                                value={passwordData.new_password}
                                                onChange={e => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm New Password</label>
                                        <div className="relative">
                                            <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="password"
                                                value={passwordData.new_password_confirmation}
                                                onChange={e => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg shadow-blue-600/20 uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={13} /> : <Lock size={13} />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
