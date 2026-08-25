import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
    User, Lock, Shield, Phone, Building, Save, Key, Loader2, Sparkles, MapPin, 
    CheckCircle2, AlertCircle, Settings, Camera, Clock, Activity, FileText, CheckSquare,
    Building2, ArrowRight, ExternalLink
} from "lucide-react";
import { Input } from "../ui/Input";
import { getUser } from "../api/auth/getUser";
import { updateProfile } from "../api/auth/updateProfile";
import { updatePassword } from "../api/auth/updatePassword";
import { useUserStore } from "../store/useUserStore";

export default function Profile() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Tab state matching Image 2: "overview", "goals", "projects", "security"
    const initialTab = searchParams.get("tab") || "overview";
    const [activeTab, setActiveTab] = useState(initialTab);
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // Profile details state
    const [profileData, setProfileData] = useState({
        user_id: "",
        first_name: "",
        last_name: "",
        email: "",
        contact_number: "",
        role: "",
        role_label: "",
        assigned_center: null,
        profile_photo_url: null,
        cover_photo_url: localStorage.getItem("profile_cover_photo") || null
    });

    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [selectedCoverPhoto, setSelectedCoverPhoto] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

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
                email: rawUser.email || "klintruales11@gmail.com",
                contact_number: rawUser.contact_number || "",
                role: rawUser.role?.role_key || rawUser.role || "",
                role_label: rawUser.role?.role_name || "Evacuation Personnel",
                assigned_center: rawUser.assigned_center || rawUser.assignedCenter || null,
                profile_photo_url: rawUser.profile_photo_url || null,
                cover_photo_url: rawUser.cover_photo_url || localStorage.getItem("profile_cover_photo") || null
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

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && (tab === "security" || tab === "settings")) {
            setActiveTab("security");
        }
    }, [searchParams]);

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        setSearchParams({ tab: tabKey });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedCoverPhoto(file);
            const url = URL.createObjectURL(file);
            setCoverPreview(url);
            localStorage.setItem("profile_cover_photo", url);
            showMessage("Profile cover photo updated successfully.");
        }
    };

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
            const formData = new FormData();
            formData.append("first_name", profileData.first_name);
            formData.append("last_name", profileData.last_name);
            formData.append("contact_number", profileData.contact_number);
            if (selectedPhoto) {
                formData.append("profile_photo", selectedPhoto);
            }

            const res = await updateProfile(formData);
            const updatedUser = res.data?.user || res.user;

            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const newStoredUser = {
                ...storedUser,
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                name: updatedUser.name || `${updatedUser.first_name} ${updatedUser.last_name}`,
                profile_photo_url: updatedUser.profile_photo_url
            };
            useUserStore.getState().setUser(newStoredUser);

            setProfileData(prev => ({
                ...prev,
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                contact_number: updatedUser.contact_number,
                profile_photo_url: updatedUser.profile_photo_url
            }));
            
            if (photoPreview) {
                URL.revokeObjectURL(photoPreview);
                setPhotoPreview(null);
            }
            setSelectedPhoto(null);

            showMessage("Profile details updated successfully.");
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
            <div className="max-w-5xl mx-auto space-y-6 animate-pulse text-left">
                {/* HERO PROFILE SKELETON */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    {/* Banner */}
                    <div className="h-44 sm:h-52 bg-slate-200 dark:bg-slate-800/80" />

                    {/* Avatar & Header details */}
                    <div className="px-6 sm:px-8 pb-6 relative">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 bg-slate-300 dark:bg-slate-700 shadow-md" />
                            <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>

                        {/* Name & Subtitle skeleton */}
                        <div className="space-y-2.5">
                            <div className="h-8 w-56 sm:w-72 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                            <div className="h-4 w-44 sm:w-60 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>

                        {/* Tabs skeleton */}
                        <div className="mt-8 border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-3">
                            <div className="h-5 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
                            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                    </div>
                </div>

                {/* BODY CARDS SKELETON */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="h-5 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
                        <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="h-28 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                </div>
            </div>
        );
    }

    const fullName = profileData.first_name && profileData.last_name 
        ? `${profileData.first_name} ${profileData.last_name}` 
        : "is this klint? yes I am";

    const initials = `${profileData.first_name?.[0] || "I"}${profileData.last_name?.[0] || "A"}`.toUpperCase();

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            
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

            {/* HERO PROFILE CONTAINER (MATCHES IMAGE 2 UI EXACTLY) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                
                {/* 1. DECORATIVE / CUSTOM COVER PHOTO BANNER */}
                <div className="h-44 sm:h-52 bg-gradient-to-r from-sky-200 via-purple-200 to-pink-200 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden group">
                    {coverPreview || profileData.cover_photo_url ? (
                        <img 
                            src={coverPreview || profileData.cover_photo_url} 
                            alt="Profile Cover" 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <svg className="absolute inset-0 w-full h-full opacity-40 dark:opacity-20 pointer-events-none" viewBox="0 0 1000 300" preserveAspectRatio="none">
                            <path d="M0,100 C150,200 350,0 500,100 C650,200 900,50 1000,150 L1000,300 L0,300 Z" fill="url(#grad1)"/>
                            <path d="M0,150 C200,50 400,250 600,120 C800,200 900,100 1000,200 L1000,300 L0,300 Z" fill="url(#grad2)" opacity="0.6"/>
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="50%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    )}

                    {/* Change Cover Photo Button */}
                    <label className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-2 border border-white/20 shadow-md z-20">
                        <Camera size={14} />
                        <span>Change Cover</span>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleCoverChange}
                        />
                    </label>
                </div>

                {/* 2. PROFILE HEADER CONTENT & AVATAR (Image 2 Layout) */}
                <div className="px-6 sm:px-8 pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                        
                        {/* Overlapping Large Avatar */}
                        <div className="relative group">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 bg-[#0f2b5c] text-[#38bdf8] font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-xl overflow-hidden">
                                {photoPreview || profileData.profile_photo_url ? (
                                    <img src={photoPreview || profileData.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>

                            {/* Camera Change Icon */}
                            <label className="absolute bottom-1 right-1 w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-20">
                                <Camera size={16} />
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        </div>

                        {/* Right Action Button (Account settings) */}
                        <div className="sm:self-end pt-2">
                            <button
                                onClick={() => handleTabChange("security")}
                                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-xs"
                            >
                                <Settings size={14} className="text-slate-500 dark:text-slate-400" />
                                Account settings
                            </button>
                        </div>
                    </div>

                    {/* Name & Subtitle Details (Image 2) */}
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {fullName}
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{profileData.role_label || profileData.role || "Evacuation Personnel"}</span>
                            {profileData.assigned_center && (
                                <>
                                    <span>•</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-bold">{profileData.assigned_center.name}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 3. NAVIGATION TABS (Overview, Security) */}
                    <div className="mt-8 border-b border-slate-200 dark:border-slate-800 flex gap-6 text-sm font-semibold">
                        <button
                            onClick={() => handleTabChange("overview")}
                            className={`pb-3 relative transition-colors ${
                                activeTab === "overview"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                        >
                            Overview
                            {activeTab === "overview" && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                            )}
                        </button>

                        <button
                            onClick={() => handleTabChange("security")}
                            className={`pb-3 relative transition-colors ${
                                activeTab === "security"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                        >
                            Security & Details
                            {activeTab === "security" && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* TAB BODY CONTENT */}
            {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    
                    {/* ASSIGNED EVACUATION CENTER SECTION (Direct Access) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
                                Assigned Evacuation Center
                            </h3>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                Duty Station
                            </span>
                        </div>

                        {profileData.assigned_center ? (
                            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                                {profileData.assigned_center.name}
                                            </h4>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                Active Station
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                            <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                                            {profileData.assigned_center.osm_address || profileData.assigned_center.address?.full_address || "Barangay Mambaling, Cebu City"}
                                        </p>
                                    </div>

                                    {/* Direct Access Button */}
                                    <button
                                        onClick={() => navigate(`/evacuation-centers/${profileData.assigned_center.evacuation_center_id}`)}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md dark:shadow-none shadow-blue-600/20 transition-all flex-shrink-0 cursor-pointer"
                                    >
                                        <Building2 size={16} />
                                        <span>Direct Access to Center</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>

                                {/* Occupancy Stats Bar */}
                                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-slate-600 dark:text-slate-400">Capacity Utilization</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                            {profileData.assigned_center.current_occupancy || 0} / {profileData.assigned_center.capacity || 100} Occupied
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                                            style={{ 
                                                width: `${Math.min(100, Math.round(((profileData.assigned_center.current_occupancy || 0) / (profileData.assigned_center.capacity || 100)) * 100))}%` 
                                            }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Not Assigned Empty State */
                            <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Not Assigned
                                            </h4>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                Unassigned
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            You currently have no assigned evacuation center duty station.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate("/evacuation-centers")}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
                                >
                                    <span>Browse All Centers</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {activeTab === "security" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                    
                    {/* Profile Details Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-5">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <User size={18} className="text-blue-500" />
                                Personal Information
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Update your account profile details</p>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="First Name"
                                    value={profileData.first_name}
                                    onChange={e => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                                    placeholder="Enter first name"
                                />
                                <Input
                                    label="Last Name"
                                    value={profileData.last_name}
                                    onChange={e => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                                    placeholder="Enter last name"
                                />
                            </div>

                            <Input
                                label="Contact Number"
                                icon={Phone}
                                value={profileData.contact_number}
                                onChange={e => setProfileData(prev => ({ ...prev, contact_number: e.target.value }))}
                                placeholder="e.g. 09123456789"
                            />

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Password Update Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-5">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Lock size={18} className="text-purple-500" />
                                Change Password
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your account uses a strong password</p>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <Input
                                label="Current Password"
                                type="password"
                                icon={Lock}
                                value={passwordData.current_password}
                                onChange={e => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                                placeholder="••••••••"
                            />

                            <Input
                                label="New Password"
                                type="password"
                                icon={Key}
                                value={passwordData.new_password}
                                onChange={e => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                placeholder="At least 8 characters"
                            />

                            <Input
                                label="Confirm New Password"
                                type="password"
                                icon={Key}
                                value={passwordData.new_password_confirmation}
                                onChange={e => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                                placeholder="Repeat new password"
                            />

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-5 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-700 transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            )}

        </div>
    );
}
