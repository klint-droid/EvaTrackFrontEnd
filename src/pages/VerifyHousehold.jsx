import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  QrCode,
  Search,
  UserPlus,
  MapPin,
  AlertCircle,
  CheckCircle2,
  SearchIcon,
  Navigation,
  User,
  Loader2,
  X,
  Sparkles,
  Fingerprint,
  Plus
} from "lucide-react";

import QRScanner from "../components/QRScanner";

import { scanQR } from "../api/evacuationRecords/scanQR";
import { searchHousehold } from "../api/evacuationRecords/searchHousehold";
import { createHousehold } from "../api/evacuationRecords/createHousehold";
import { getUser } from "../api/auth/getUser";
import { getCenter } from "../api/evacuation/getCenter";
import { admitHousehold } from "../api/evacuationRecords/admitHousehold";

export default function VerifyHousehold() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("admit"); // "admit" = Search Registry, "manual" = New On-site entry
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(undefined); // undefined indicates search has not run yet
  const [headName, setHeadName] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [centerName, setCenterName] = useState(null);

  const [assignmentModal, setAssignmentModal] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false); // Modal for live QR Scanner
  const [scannedData, setScannedData] = useState(null);
  const [memberCount, setMemberCount] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [modalError, setModalError] = useState(null); // Error shown inside the admission modal

  const records = Array.isArray(results) ? results : (Array.isArray(results?.data) ? results.data : (results?.data?.data || []));

  const showMessage = (msg, type = "success") => {
    setMessage({
      text: msg || (type === "error" ? "Something went wrong." : "Success."),
      type,
    });

    setTimeout(() => setMessage(null), 3500);
  };

  const getApiBody = (res) => {
    if (res?.data?.message || res?.data?.data) {
      return res.data;
    }

    return res;
  };

  const getPayload = (res) => {
    const body = getApiBody(res);
    return body?.data || body;
  };

  const getMessage = (res, fallback = "Success.") => {
    const body = getApiBody(res);
    return body?.message || fallback;
  };

  const navigateToHouseholdDetail = (payload) => {
    const evacuation =
      payload?.evacuation ||
      payload?.record ||
      payload?.evacuation_record;

    const household =
      payload?.household ||
      evacuation?.household ||
      scannedData?.household;

    if (!household?.household_id) {
      showMessage("Household admitted, but household details could not be opened.", "error");
      return;
    }

    if (!evacuation?.evacuation_id) {
      navigate(`/households/${household.household_id}`);
      return;
    }

    navigate(
      `/households/${household.household_id}?evacuation_id=${evacuation.evacuation_id}&center_id=${evacuation.center_id || user?.assigned_center_id}`
    );
  };

  useEffect(() => {
    getUser()
      .then((res) => {
        const body = getApiBody(res);
        setUser(body?.data || body);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!user?.assigned_center_id) return;

    getCenter(user.assigned_center_id)
      .then((res) => {
        const body = getApiBody(res);
        const center = body?.data || body;
        setCenterName(
          center?.name || center?.center_name || user.assigned_center_id
        );
      })
      .catch(() => {
        setCenterName(user.assigned_center_id);
      });
  }, [user]);

  const handleScan = async (rawScan) => {
    // QR codes encode a full JSON object — extract household_id and metadata from it if present
    let householdId = rawScan;
    let qrParsed = null;
    try {
      let parsed = JSON.parse(rawScan);
      if (parsed && typeof parsed === "object") {
        // Handle double-encoded JSON where household_id is stringified JSON
        if (parsed.household_id) {
          try {
            const nested = JSON.parse(parsed.household_id);
            if (nested && typeof nested === "object" && nested.household_id) {
              parsed = nested;
            }
          } catch {
            // Ignore parsing errors for nested JSON
          }
        }
        
        if (parsed.household_id) {
          householdId = parsed.household_id;
          qrParsed = parsed; // retain full QR payload for fallback use
        }
      }
    } catch {
      // Not JSON — treat as a plain household ID string
    }

    setLoading(true);

    try {
      const res = await searchHousehold(householdId);
      const recordsList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.data || []));
      const household = recordsList.find(h => h.household_id === householdId) || recordsList[0];

      if (household) {
        // ✅ Path A: full household data found via search → open confirmation modal
        setScannedData({
          household,
          isQR: true
        });
        setMemberCount(household?.member_count || 1);
        const memberIds = Array.isArray(household?.members) 
          ? household.members.map(m => m.member_id) 
          : [];
        setSelectedMembers(memberIds);
        // FIX #3: Show success notification before opening the modal
        showMessage("QR scanned successfully. Confirm admission below.");
        setModalError(null);
        setAssignmentModal(true);
      } else {
        // FIX #2: Path B: household not returned by search — build minimal object from QR data
        // and open the same confirmation modal instead of skipping it
        const minimalHousehold = {
          household_id: householdId,
          household_name: qrParsed?.household_name || householdId,
        };
        setScannedData({
          household: minimalHousehold,
          isQR: true,
        });
        setMemberCount(1);
        setSelectedMembers([]);
        showMessage("QR scanned. Confirm member count to proceed.");
        setModalError(null);
        setAssignmentModal(true);
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Scan failed. Please try again.", "error");
      // FIX #1: Reopen the QR scanner so the user can try again without manually clicking the button
      setQrModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      showMessage("Please enter household name or ID.", "error");
      return;
    }

    setLoading(true);

    try {
      const data = await searchHousehold(query);
      setResults(data);
    } catch (err) {
      showMessage(err.response?.data?.message || "Search failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAdmissionModal = (household) => {
    setScannedData({
      household,
    });
    setMemberCount(household?.member_count || 1);
    const memberIds = Array.isArray(household?.members) 
      ? household.members.map(m => m.member_id) 
      : [];
    setSelectedMembers(memberIds);
    setModalError(null);
    setAssignmentModal(true);
  };

  const handleVerify = (household) => {
    openAdmissionModal(household);
  };

  const handleCreate = async () => {
    if (loading) return;

    if (!headName.trim() || !memberCount || Number(memberCount) <= 0) {
      showMessage("Please enter household name and number of members.", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await createHousehold({ household_name: headName });
      const payload = getPayload(res);

      const household =
        payload?.household ||
        payload?.data ||
        payload;

      if (!household?.household_id) {
        showMessage("Household admitted, but response is missing household ID.", "error");
        return;
      }

      showMessage("Household admitted. Confirm final count.");

      setScannedData({
        household,
      });

      setModalError(null);
      setAssignmentModal(true);
      setHeadName("");
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to create household.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAdmission = async () => {
    if (loading) return;

    const hasMembers = scannedData?.household?.members?.length > 0;

    // Pre-flight: QR path requires the household to have members registered in the system
    if (scannedData?.isQR && !hasMembers) {
      setModalError("This household has no registered members. Please add household members first before scanning in.");
      return;
    }

    if (hasMembers && selectedMembers.length === 0) {
      setModalError("Please select at least one member to evacuate.");
      return;
    }

    if (!hasMembers && (!memberCount || Number(memberCount) <= 0)) {
      setModalError("Please enter the number of members.");
      return;
    }

    if (!user?.assigned_center_id) {
      setModalError("You are not assigned to an evacuation center.");
      return;
    }

    if (!scannedData?.household?.household_id) {
      setModalError("No household selected.");
      return;
    }

    setModalError(null);

    setLoading(true);

    try {
      let res;
      if (scannedData?.isQR) {
        res = await scanQR({
          household_id: scannedData.household.household_id,
          member_ids: hasMembers ? selectedMembers : undefined,
        });
      } else {
        res = await admitHousehold({
          household_id: scannedData.household.household_id,
          member_ids: hasMembers ? selectedMembers : undefined,
          member_count: !hasMembers ? Number(memberCount) : undefined,
        });
      }

      const payload = getPayload(res);

      showMessage(getMessage(res, "Admission complete."));

      setAssignmentModal(false);
      setScannedData(null);
      setMemberCount("");
      setSelectedMembers([]);

      navigateToHouseholdDetail(payload);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Admission failed.";
      // Show error inside the modal so it's visible, not hidden behind the overlay
      setModalError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const closeAdmissionModal = () => {
    if (scannedData?.household) {
      const confirmClose = confirm("Household is not yet admitted. Close anyway?");
      if (!confirmClose) return;
    }

    setAssignmentModal(false);
    setScannedData(null);
    setSelectedMembers([]);
    setModalError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Fingerprint className="text-indigo-600" size={28} />
            Household Verification
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Registry Admission & Verification Control
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">
                Station
              </p>
              <p className="text-xs font-bold text-slate-700">
                {centerName ?? "---"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Simplified Tabs: Verify Registry & Manual Entry */}
      <div className="flex p-1 bg-slate-200/50 rounded-2xl w-full sm:w-fit">
        {[
          { id: "admit", label: "Registry Admission", icon: Search },
          { id: "manual", label: "On-Site Registration", icon: UserPlus },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === t.id
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
            }`}
          >
            <t.icon size={14} strokeWidth={2.5} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Feedback Alert */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border animate-in zoom-in-95 duration-300 ${
            message.type === "error"
              ? "bg-red-50 border-red-100 text-red-700"
              : "bg-emerald-50 border-emerald-100 text-emerald-700"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          <span className="text-xs font-black uppercase tracking-wide">
            {message.text}
          </span>
        </div>
      )}

      {/* Main Screen Wrapper */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-[2rem] shadow-sm overflow-hidden min-h-[320px] sm:min-h-[380px] flex flex-col relative">

        {tab === "admit" && (
          <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
            
            {/* Title */}
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Search size={16} className="text-indigo-600" />
                Registry Manual Query
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                Query family head names/IDs, or trigger QR card scanning below
              </p>
            </div>

            {/* Input fields beside QR scanner button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                  size={16}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  placeholder="Enter family ID or Family Head name..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex gap-2">
                {/* 📣 Interactive QR Scan Prompt Trigger */}
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="px-4 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all rounded-xl flex items-center justify-center gap-2 shadow-sm font-black text-[10px] uppercase tracking-widest"
                  title="Scan Digital QR Card"
                >
                  <QrCode size={18} />
                  <span>Scan QR</span>
                </button>

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : "Search"}
                </button>
              </div>
            </div>

            {/* Search Registry Results Box */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {results === undefined ? (
                <div className="py-12 text-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center space-y-2">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Awaiting query database sync...</p>
                  <p className="text-[10px] text-slate-400">Type family head credentials above or trigger live scan</p>
                </div>
              ) : records.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-100 rounded-2xl bg-rose-50/20">
                  <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">No matching families found in registry.</p>
                </div>
              ) : (
                records.map((h) => (
                  <div
                    key={h.household_id}
                    className="p-4 border border-slate-100 rounded-2xl bg-slate-50/40 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-all">
                        <User size={16} />
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-800 leading-tight">
                          {h.household_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            ID: {h.household_id}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            Members: {h.member_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleVerify(h)}
                      className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      <span>Admit</span>
                      <Navigation size={10} fill="currentColor" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "manual" && (
          <div className="p-5 sm:p-8 flex flex-col items-center justify-center flex-1 min-h-[320px] sm:min-h-[380px]">
            <div className="max-w-md w-full p-6 bg-slate-50/40 border border-slate-100 rounded-3xl space-y-6">
              <div className="text-center space-y-1 mb-2">
                <h2 className="text-base font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
                  <UserPlus size={18} className="text-indigo-600" />
                  On-Site Emergency Entry
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Create new listing for unregistered families
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                  Full Name of Household Head
                </label>
                <input
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
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
                  placeholder="e.g. 4"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={!headName || !memberCount || loading}
                className="w-full py-3.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    <span>Create & Admit Household</span>
                    <Plus size={12} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📣 QR CAMERA SCANNING MODAL VIEW */}
      {qrModalOpen &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
              onClick={() => setQrModalOpen(false)}
            />

            <div className="relative bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 p-5 sm:p-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <QrCode size={15} className="text-indigo-600 animate-pulse" />
                  Live QR Camera Scanner
                </h3>
                <button
                  onClick={() => setQrModalOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* QR Scanner viewport box */}
              <div className="w-full aspect-square bg-slate-50 rounded-[2rem] border border-slate-200 flex items-center justify-center overflow-hidden relative shadow-inner">
                <QRScanner onScan={(id) => {
                  setQrModalOpen(false);
                  handleScan(id);
                }} />
                {/* Visual scan targets */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 border border-white/20 rounded-2xl flex items-center justify-center pointer-events-none">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500 rounded-tl-md" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500 rounded-tr-md" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500 rounded-bl-md" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500 rounded-br-md" />
                </div>
              </div>

              <div className="text-center mt-5 space-y-1">
                <p className="text-xs font-bold text-slate-600">Align QR code inside the target frame</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Awaiting scan telemetry...</p>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Admission Finalize Modal */}
      {assignmentModal &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
              onClick={closeAdmissionModal}
            />

            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" />
                  Finalize Admission
                </h2>

                <button
                  onClick={closeAdmissionModal}
                  className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Error feedback visible inside the modal */}
                {modalError && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100 animate-in zoom-in-95 duration-200">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-600 leading-snug">{modalError}</p>
                  </div>
                )}
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                    Household Identified
                  </p>
                  <p className="text-sm font-bold text-indigo-900">
                    {scannedData?.household?.household_name ||
                      scannedData?.household?.head_name ||
                      "Selected household"}
                  </p>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                    {scannedData?.household?.household_id}
                  </p>
                </div>

                {scannedData?.household?.members && scannedData.household.members.length > 0 ? (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Select Members to Evacuate ({selectedMembers.length} selected)
                    </label>
                    <div className="max-h-[200px] overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-2.5">
                      {scannedData.household.members.map((member) => {
                        const isChecked = selectedMembers.includes(member.member_id);
                        return (
                          <label key={member.member_id} className="flex items-start gap-3 cursor-pointer group p-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedMembers(selectedMembers.filter(id => id !== member.member_id));
                                } else {
                                  setSelectedMembers([...selectedMembers, member.member_id]);
                                }
                              }}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 leading-tight group-hover:text-indigo-600 transition-colors">
                                {member.first_name} {member.last_name}
                              </p>
                              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                                {member.relationshipDetail?.relationship_name || member.relationship_id || "Family Member"}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Number of Members
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 4"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      value={memberCount}
                      onChange={(e) => setMemberCount(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 font-medium px-1">
                      This will be used as the declared evacuee count. You can add individual member details after admission.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={closeAdmissionModal}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  Cancel
                </button>

                <button
                  disabled={loading || (scannedData?.household?.members?.length > 0 ? selectedMembers.length === 0 : !memberCount)}
                  onClick={handleConfirmAdmission}
                  className={`px-5 py-2.5 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider flex items-center gap-2 transition-all ${
                    loading || (scannedData?.household?.members?.length > 0 ? selectedMembers.length === 0 : !memberCount)
                      ? "bg-indigo-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-600/20"
                  }`}
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