import React from "react";
import { UserPlus, Plus, Loader2 } from "lucide-react";

export default function ManualEntry({
    headName,
    setHeadName,
    contactNumber,
    setContactNumber,
    memberCount,
    setMemberCount,
    handleCreate,
    loading
}) {
    return (
        <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[380px]">
            <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm">
                <div className="text-center space-y-1 mb-2">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                        <UserPlus size={20} className="text-blue-600" />
                        On-Site Emergency Entry
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Create new listing for unregistered families
                    </p>
                </div>

                <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        Full Name of Household Head
                    </label>
                    <input
                        value={headName}
                        onChange={(e) => setHeadName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                </div>

                <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        Contact Number (Optional)
                    </label>
                    <input
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="e.g. 09123456789"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                </div>

                <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        Number of Members
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={memberCount}
                        onChange={(e) => setMemberCount(e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all"
                    />
                </div>

                <button
                    onClick={handleCreate}
                    disabled={!headName || !memberCount || loading}
                    className="w-full py-3.5 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                    ) : (
                        <>
                            <span>Create & Admit Household</span>
                            <Plus size={14} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
