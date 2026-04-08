import { useState, useEffect } from "react";
import { 
  QrCode, 
  Search, 
  UserPlus, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  SearchIcon,
  Navigation,
  ShieldCheck,
  User,
  Loader2
} from "lucide-react";
import QRScanner from "../components/QRScanner";

import { scanQR } from "../api/evacuationRecords/scanQR";
import { searchHousehold } from "../api/evacuationRecords/searchHousehold";
import { verifyManual } from "../api/evacuationRecords/verifyManual";
import { createHousehold } from "../api/evacuationRecords/createHousehold";
import { getUser } from "../api/auth/getUser";
import { getCenter } from "../api/evacuation/getCenter";

export default function VerifyHousehold() {
  const [tab, setTab] = useState("scan");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [headName, setHeadName] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [centerName, setCenterName] = useState(null);

  const showMessage = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3500);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser();
        setUser(res.data);
      } catch (err) { console.error(err); }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCenter = async () => {
      if (!user?.assigned_evacuation_center_id) return;
      try {
        const res = await getCenter(user.assigned_evacuation_center_id);
        setCenterName(res.data.name);
      } catch (err) { console.error(err); }
    };
    fetchCenter();
  }, [user]);

  const handleScan = async (household_id) => {
    setLoading(true);
    try {
      const res = await scanQR(household_id);
      showMessage(res.message);
    } catch (err) {
      showMessage(err.response?.data?.message || "Scan failed", "error");
    } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
        const data = await searchHousehold(query);
        setResults(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleVerify = async (id) => {
    try {
      const res = await verifyManual(id);
      showMessage(res.message);
    } catch (err) {
      showMessage(err.response?.data?.message, "error");
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await createHousehold(headName);
      showMessage(res.message);
      setHeadName("");
      setTab("scan");
    } catch (err) {
      showMessage(err.response?.data?.message, "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 sm:p-0">
      
      {/* ⚡️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={28} />
            Household Verification
          </h1>
          <p className="text-sm text-slate-500 font-medium">Verify evacuees for center admission</p>
        </div>

        {/* 📍 CENTER BADGE */}
        {user && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Current Post</p>
              <p className="text-xs font-bold text-slate-700">{centerName || "Assigning..."}</p>
            </div>
          </div>
        )}
      </div>

      {/* ⚡️ TAB NAVIGATION */}
      <div className="flex p-1 bg-slate-200/50 rounded-[1.25rem] w-full md:w-fit">
        {[
          { id: "scan", label: "Scanner", icon: QrCode },
          { id: "search", label: "Registry Search", icon: Search },
          { id: "manual", label: "Quick Entry", icon: UserPlus },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 flex-1 md:flex-none ${
              tab === t.id
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <t.icon size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ⚡️ FEEDBACK TOAST */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border animate-in zoom-in-95 duration-300 ${
          message.type === "error" 
            ? "bg-red-50 border-red-100 text-red-700" 
            : "bg-emerald-50 border-emerald-100 text-emerald-700"
        }`}>
          {message.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      {/* ⚡️ CONTENT AREA */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        
        {/* 📷 SCAN TAB */}
        {tab === "scan" && (
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="max-w-md w-full space-y-4">
                <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden shadow-inner">
                    <QRScanner onScan={handleScan} />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Alignment Guide</h3>
                    <p className="text-xs text-slate-400">Position the QR code within the frame to auto-verify</p>
                </div>
            </div>
          </div>
        )}

        {/* 🔍 SEARCH TAB */}
        {tab === "search" && (
          <div className="p-8 space-y-6">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Household Head Name or ID..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="px-8 py-3.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Search"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((h) => (
                <div key={h.household_id} className="p-5 border border-slate-100 rounded-[1.5rem] bg-slate-50/50 flex justify-between items-center group hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                        <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-tight">{h.head_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">ID: {h.household_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerify(h.household_id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Verify Admission <Navigation size={12} fill="currentColor" />
                  </button>
                </div>
              ))}
              {results.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center space-y-2 opacity-30">
                    <SearchIcon size={48} className="mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">No matching households</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 📝 MANUAL TAB */}
        {tab === "manual" && (
          <div className="p-8 flex flex-col items-center justify-center flex-1">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center space-y-2 mb-4">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">On-the-spot Registration</h2>
                    <p className="text-xs text-slate-400 font-medium">Register a new household if not found in the registry.</p>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Household Head Full Name</label>
                    <input
                        value={headName}
                        onChange={(e) => setHeadName(e.target.value)}
                        placeholder="e.g. Roberto Dela Cruz"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    />
                </div>

                <button 
                    onClick={handleCreate}
                    disabled={!headName || loading}
                    className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                    {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Register & Admit"}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}