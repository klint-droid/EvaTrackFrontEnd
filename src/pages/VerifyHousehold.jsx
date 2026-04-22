import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  QrCode, Search, UserPlus, MapPin, AlertCircle, CheckCircle2, 
  SearchIcon, Navigation, User, Loader2, X, 
  DoorOpen, Sparkles, Fingerprint
} from "lucide-react";
import QRScanner from "../components/QRScanner";

import { scanQR } from "../api/evacuationRecords/scanQR";
import { searchHousehold } from "../api/evacuationRecords/searchHousehold";
import { verifyManual } from "../api/evacuationRecords/verifyManual";
import { createHousehold } from "../api/evacuationRecords/createHousehold";
import { getUser } from "../api/auth/getUser";
import { getCenter } from "../api/evacuation/getCenter";
import { suggestRoom } from "../api/rooms/suggestRoom";
import { assignRoom } from "../api/rooms/assignRoom";
import { admitHousehold } from "../api/evacuationRecords/admitHousehold";

export default function VerifyHousehold() {
  const [tab, setTab] = useState("scan");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [headName, setHeadName] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [centerName, setCenterName] = useState(null);
  const [suggestError, setSuggestError] = useState(null);

  // MODAL STATES
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [memberCount, setMemberCount] = useState("");
  const [suggestedRoom, setSuggestedRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const showMessage = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3500);
  };

  useEffect(() => {
    getUser().then(res => setUser(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user?.assigned_center_id) return;

    getCenter(user.assigned_center_id)
      .then(res => setCenterName(res.data.name))
      .catch(console.error);

  }, [user]);

  const handleVerificationSuccess = (data, msg) => {
    showMessage(msg);
    setScannedData(data);
    setAssignmentModal(true);
    setMemberCount(data?.evacuation?.evacuated_count || "");
    setSuggestedRoom(null);
    setSelectedRoom(null);
  };

  const handleScan = async (household_id) => {
    setLoading(true);
    try {
      const res = await scanQR(household_id);
      handleVerificationSuccess(res.data, res.message);
    } catch (err) {
      showMessage(err.response?.data?.message || "Scan failed", "error");
    } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchHousehold(query);
      setResults(data);
    } finally { setLoading(false); }
  };

  const handleVerify = async (id) => {
    try {
      const res = await verifyManual(id);
      handleVerificationSuccess(res.data, res.message);
    } catch (err) {
      showMessage(err.response?.data?.message, "error");
    }
  };

  const handleCreate = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await createHousehold(headName, memberCount);

      showMessage("Household created");

      setScannedData({
        household: res.data
      });

      setAssignmentModal(true);

      setHeadName("");
      setMemberCount(prev => prev || 1);
    } catch (err) {
      showMessage(err.response?.data?.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const count = parseInt(memberCount);

    if (!count || count <= 0 || !user?.assigned_center_id) return;

    const timeout = setTimeout(() => {
      suggestRoom(user.assigned_center_id, count)
        .then(res => {
          setSuggestedRoom(res.data.data);
          setSuggestError(null);
        })
        .catch(err => {
          setSuggestedRoom(null);

          if (err.response?.status === 404) {
            setSuggestError("No suitable room found. You can continue without assigning a room.");
          } else {
            setSuggestError("Failed to fetch room suggestion");
          }
        });
    }, 500);

    return () => clearTimeout(timeout);

  }, [memberCount, user]);

  const handleAssignRoom = async () => {
    if (loading) return;
    if (!memberCount || memberCount <= 0) {
      showMessage("Please enter number of members", "error");
      return;
    }

    if (!user?.assigned_center_id) {
      showMessage("You are not assigned to an evacuation center", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await admitHousehold(
        scannedData.household.household_id,
        memberCount
      );

      const roomId = selectedRoom?.trim() || suggestedRoom?.room_id || null;

      if (roomId) {
        await assignRoom(roomId, {
          evacuation_id: res.data.evacuation.evacuation_id,
          household_id: scannedData.household.household_id,
          members: parseInt(memberCount)
        });
      }

      showMessage("Admission complete");
      setAssignmentModal(false);

      setScannedData(null);
      setMemberCount("");
      setSuggestedRoom(null);
      setSelectedRoom(null);

    } catch (err) {
      showMessage(err.response?.data?.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ⚡️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Fingerprint className="text-blue-600" size={28} />
            Household Verification
          </h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider text-[10px]">Registry & Admission Control</p>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Station</p>
              <p className="text-xs font-bold text-slate-700">{centerName || "Assigning..."}</p>
            </div>
          </div>
        )}
      </div>

      {/* ⚡️ NAVIGATION TABS */}
      <div className="flex p-1 bg-slate-200/50 rounded-2xl w-full md:w-fit">
        {[
          { id: "scan", label: "QR Scan", icon: QrCode },
          { id: "search", label: "Registry", icon: Search },
          { id: "manual", label: "New Entry", icon: UserPlus },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t.id
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
            }`}
          >
            <t.icon size={14} strokeWidth={2.5} />
            <span>{t.label}</span>
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
          <span className="text-xs font-black uppercase tracking-wide">{message.text}</span>
        </div>
      )}

      {/* ⚡️ MAIN CONTENT WORKSPACE */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden min-h-[420px] flex flex-col relative">
        
        {tab === "scan" && (
          <div className="p-10 flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="w-full max-w-[320px] aspect-square bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
              <QRScanner onScan={handleScan} />
              <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Awaiting Data Link</h3>
              <p className="text-sm font-medium text-slate-400">Position the household QR inside the frame</p>
            </div>
          </div>
        )}

        {tab === "search" && (
          <div className="p-8 space-y-6">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Household ID or Head Name..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="px-8 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Query"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results?.data?.length === 0 ? (
                <p className="text-center text-slate-400 text-sm">No results found</p>
                ) : (
                  results?.data?.map((h) => (
                  <div key={h.household_id} className="p-5 border border-slate-100 rounded-[1.5rem] bg-slate-50/50 flex justify-between items-center group hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                          <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-tight">{h.household_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {h.household_id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVerify(h.household_id)}
                      className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-90 transition-all"
                    >
                      <Navigation size={14} fill="currentColor" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "manual" && (
          <div className="p-8 flex flex-col items-center justify-center flex-1">
            <div className="max-w-sm w-full space-y-6">
                <div className="text-center space-y-1 mb-4">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">On-Site Registration</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Emergency Field Entry Only</p>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name of Household Head</label>
                    <input
                        value={headName}
                        onChange={(e) => setHeadName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Number of Members
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={memberCount}
                    onChange={(e) => setMemberCount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <button 
                    onClick={handleCreate}
                    disabled={!headName || !memberCount || loading}
                    className="w-full py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Create & Admit Household"}
                </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 ASSIGNMENT MODAL (React Portal) */}
      {assignmentModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
          <div className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200" onClick={() => setAssignmentModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" /> Finalize Admission
              </h2>
              <button onClick={() => setAssignmentModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={16}/></button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Household Identified</p>
                <p className="text-sm font-bold text-blue-900">{scannedData?.household?.household_name || scannedData?.household?.head_name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Number of Members</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 4"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={memberCount}
                  onChange={(e) => setMemberCount(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                  Logistics Allocation
                  {suggestedRoom && <span className="text-blue-600 animate-pulse">Auto-matched</span>}
                </label>
                
                {suggestedRoom ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-900 text-white rounded-xl shadow-lg">
                    <DoorOpen size={16} className="text-blue-400" />
                    <div>
                      <p className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">
                        Recommended Room
                      </p>
                      <p className="text-xs font-black">
                        {suggestedRoom.room_number || suggestedRoom.room_name}
                      </p>
                      <p className="text-[10px] opacity-70">
                        Capacity Left: {suggestedRoom.max_capacity - suggestedRoom.current_occupancy}
                      </p>
                    </div>
                  </div>
                ) : suggestError ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                    ⚠️ {suggestError}
                    <div className="text-[10px] mt-1 opacity-70">
                      You may manually assign a room below.
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic px-1 font-medium">
                    Input member count for room recommendation...
                  </div>
                )}
                <div className="relative group">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input
                    placeholder="Manual Room Override (Optional)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium focus:border-slate-400 outline-none transition-all"
                    onChange={(e) => setSelectedRoom(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => {
                  if (scannedData?.household && !scannedData?.evacuation) {
                    const confirmClose = confirm("Household is not yet admitted. Close anyway?");
                    if (!confirmClose) return;
                  }
                  setAssignmentModal(false);
                }}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                disabled={loading || !memberCount}
                onClick={handleAssignRoom} 
                className={`px-5 py-2.5 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider flex items-center gap-2 transition-all
                ${loading || !memberCount 
                  ? "bg-blue-300 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-600/20"
                }
              `}
              >
                {loading && <Loader2 size={12} className="animate-spin" />}
                Confirm Admission
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}