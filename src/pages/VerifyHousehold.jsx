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
  Users,
  Keyboard,
  UserCheck,
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
import { getUnitsByCenter } from "../api/units/getUnitsByCenter";
import { assignHousehold } from "../api/allocations/assignHousehold";

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
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");

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

    getUnitsByCenter(user.assigned_center_id)
      .then((res) => {
        setUnits(res.data || []);
      })
      .catch(console.error);
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
          ? household.members.filter(m => !getActiveEvacuation(m)).map(m => m.member_id) 
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
      ? household.members.filter(m => !getActiveEvacuation(m)).map(m => m.member_id) 
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
      const evacuation = payload?.evacuation || payload?.record || payload?.evacuation_record || payload;
      const evacuationId = evacuation?.evacuation_id;

      if (selectedUnitId && evacuationId) {
        try {
          await assignHousehold(selectedUnitId, evacuationId);
        } catch (assignErr) {
          const assignErrMsg = assignErr.response?.data?.message || "Unit assignment failed.";
          throw new Error(`Admitted successfully, but allocation failed: ${assignErrMsg}`);
        }
      }

      showMessage(getMessage(res, "Admission complete."));

      setAssignmentModal(false);
      setScannedData(null);
      setMemberCount("");
      setSelectedMembers([]);
      setSelectedUnitId("");

      navigateToHouseholdDetail(payload);
    } catch (err) {
      const errMsg = err.message || err.response?.data?.message || "Admission failed.";
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
    setSelectedUnitId("");
  };

  const getHeadName = (h) => {
    if (!h.members || h.members.length === 0) return 'Not Specified';
    const head = h.members.find(m => 
      m.relationship?.relationship_key === 'head' || 
      m.relationship?.relationship_label === 'Head of Household' ||
      m.relationship_id === 1
    );
    return head ? `${head.first_name} ${head.last_name}` : 'Not Specified';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '—';
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return '—';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  const getActiveEvacuation = (member) => {
    const records = member?.evacuated_members || member?.evacuatedMembers || [];
    return records.find(em => {
      const record = em.evacuation_record || em.evacuationRecord;
      return record && 
        (record.household_status_id === 2 || record.household_status_id === '2') && 
        !record.event?.ended_at;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">

      {/* Header matching Disaster Events style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-950 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Household Verification
            </h1>
            {user && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 font-semibold rounded-md text-xs border border-amber-100 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Station: {centerName ?? "---"}
              </div>
            )}
          </div>
        </div>
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

      {/* Main Screen Wrapper: Card with tabs inside */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[380px] flex flex-col relative">
        
        {/* Tabs Row matching mockup */}
        <div className="border-b border-slate-200 px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setTab("admit")}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer flex items-center gap-2 focus:outline-none ${
                tab === "admit"
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Search size={16} />
              Registry Admission
            </button>
            <button
              onClick={() => setTab("manual")}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer flex items-center gap-2 focus:outline-none ${
                tab === "manual"
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus size={16} />
              On-Site Registration
            </button>
          </nav>
        </div>

        {tab === "admit" && (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Title */}
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Search size={16} className="text-blue-600" />
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  placeholder="Enter Household Name, ID, or Member Name..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/10"
                  title="Scan Digital QR Card"
                >
                  <QrCode size={18} />
                  <span>Scan QR</span>
                </button>

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center min-w-[90px]"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Search"}
                </button>
              </div>
            </div>

            {/* Search Registry Results Box */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {results === undefined ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center space-y-2">
                  <Search className="text-slate-300" size={24} />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Awaiting query database sync...</p>
                  <p className="text-[10px] text-slate-400">Type family head credentials above or trigger live scan</p>
                </div>
              ) : records.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-rose-50/20">
                  <AlertCircle className="text-rose-400 mx-auto mb-2" size={24} />
                  <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">No matching families found in registry.</p>
                </div>
              ) : (
                records.map((h) => {
                  const currentEvac = h.current_evacuation || h.currentEvacuation;
                  const isEvacuated = currentEvac && !currentEvac.event?.ended_at && (currentEvac.household_status_id === 2 || currentEvac.household_status_id === "2");
                  return (
                    <div
                      key={h.household_id}
                      className="p-5 bg-white border border-slate-200 rounded-xl border-l-[5px] border-l-blue-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 text-left"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 leading-tight">
                            {h.household_name}
                          </h3>
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[11px] font-mono font-medium">
                            {h.household_id}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" />
                            <span>Head: {getHeadName(h)}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-slate-400" />
                            <span>{h.member_count || h.members?.length || 0} Members</span>
                          </span>
                        </div>

                        {/* Evacuation Status Section */}
                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                          {isEvacuated ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 bg-rose-50 text-rose-600 font-semibold rounded text-[10px] border border-rose-100 uppercase tracking-wider">
                                Evacuated
                              </span>
                              <span className="text-slate-500 flex items-center gap-1">
                                <MapPin size={12} className="text-rose-500" />
                                Evacuated to <strong className="text-slate-700 font-bold">{currentEvac.center?.name || currentEvac.center?.center_name || currentEvac.center_id || 'Unknown Center'}</strong>
                                {currentEvac.event?.name && (
                                  <span className="text-slate-400 font-normal ml-1">
                                    (Event: {currentEvac.event.name})
                                  </span>
                                )}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-500 font-semibold rounded text-[10px] border border-slate-200 uppercase tracking-wider">
                                Not Evacuated
                              </span>
                              <span className="text-slate-400">Ready for check-in</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleVerify(h)}
                        className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm shadow-blue-600/10 transition-all duration-200 sm:self-center self-start"
                      >
                        <span>Admit</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {tab === "manual" && (
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

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col">
              
              {/* Modal Header */}
              <div className="w-full flex items-center justify-between bg-white px-5 py-4 border-b border-slate-150">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <QrCode size={18} className="text-slate-700" />
                  Scan Household QR Code
                </h3>
                <button
                  onClick={() => setQrModalOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* QR Scanner viewport box */}
              <div className="w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden relative">
                <QRScanner onScan={(id) => {
                  setQrModalOpen(false);
                  handleScan(id);
                }} />
                
                {/* Visual scan targets - glowing corner brackets */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-blue-400 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-blue-400 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-blue-400 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-blue-400 rounded-br-xl" />
                  </div>
                </div>
              </div>

              {/* Viewport Status Row */}
              <div className="w-full bg-slate-50 border-b border-slate-150 py-3.5 px-5 text-center flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-slate-500 font-medium leading-tight">
                  Align the QR code within the frame to scan automatically.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full text-[9px] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Camera Active
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="w-full bg-white px-5 py-4 flex items-center justify-between gap-4">
                <button
                  onClick={() => setQrModalOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-all"
                >
                  <X size={14} />
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setQrModalOpen(false);
                    setTab("admit");
                    setTimeout(() => {
                      const inputEl = document.querySelector('input[placeholder="Enter Household Name or Official ID..."]');
                      if (inputEl) inputEl.focus();
                    }, 150);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white hover:bg-slate-900 active:scale-95 rounded-lg text-xs font-semibold transition-all shadow-sm"
                >
                  <Keyboard size={14} />
                  Enter ID Manually
                </button>
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

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col text-left">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800 leading-tight">
                      Finalize Admission
                    </h2>
                    <p className="text-xs text-slate-505">
                      Review household details and assign accommodation.
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeAdmissionModal}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                {modalError && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100 animate-in zoom-in-95 duration-200">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-600 leading-snug">{modalError}</p>
                  </div>
                )}

                {/* HOUSEHOLD SUMMARY */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Household Summary
                  </h4>
                  
                  <div className="bg-slate-50/50 border border-slate-205 border-l-[4px] border-l-blue-600 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Household Head
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {scannedData?.household?.household_name ||
                          scannedData?.household?.head_name ||
                          "Selected household"}
                      </p>
                    </div>

                    <div className="space-y-0.5 sm:text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest sm:text-right">
                        Household ID
                      </p>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[11px] font-mono font-medium">
                        {scannedData?.household?.household_id}
                      </span>
                    </div>

                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Current Address
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        <span>
                          {scannedData?.household?.address?.full_address || "No address specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ARRIVING MEMBERS */}
                {scannedData?.household?.members && scannedData.household.members.length > 0 ? (
                  (() => {
                    const eligibleMembers = scannedData.household.members.filter(m => !getActiveEvacuation(m));
                    const allEligibleSelected = eligibleMembers.length > 0 && selectedMembers.length === eligibleMembers.length;
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Arriving Members
                          </h4>
                          <label className="flex items-center gap-1.5 text-xs text-slate-605 font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={allEligibleSelected}
                              disabled={eligibleMembers.length === 0}
                              onChange={() => {
                                if (allEligibleSelected) {
                                  setSelectedMembers([]);
                                } else {
                                  setSelectedMembers(eligibleMembers.map(m => m.member_id));
                                }
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 disabled:opacity-50"
                            />
                            <span>Select All</span>
                          </label>
                        </div>

                        {/* Members List Table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-white text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1/2">Name</span>
                            <span className="w-1/4 text-center">Age</span>
                            <span className="w-1/4 text-right">Gender</span>
                          </div>

                          <div className="divide-y divide-slate-100 bg-white max-h-[180px] overflow-y-auto">
                            {scannedData.household.members.map((member) => {
                              const isChecked = selectedMembers.includes(member.member_id);
                              const activeEvac = getActiveEvacuation(member);
                              const isDisabled = !!activeEvac;

                              return (
                                <div 
                                  key={member.member_id} 
                                  className={`px-4 py-3 flex items-center justify-between transition-colors ${
                                    isDisabled ? "bg-rose-50/30 opacity-75" : "hover:bg-slate-50/50"
                                  }`}
                                >
                                  
                                  {/* Left Checkbox & Name info */}
                                  <div className="w-1/2 flex items-start gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={isDisabled}
                                      onChange={() => {
                                        if (isChecked) {
                                          setSelectedMembers(selectedMembers.filter(id => id !== member.member_id));
                                        } else {
                                          setSelectedMembers([...selectedMembers, member.member_id]);
                                        }
                                      }}
                                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 disabled:opacity-50"
                                    />
                                    <div>
                                      <p className="text-xs font-bold text-slate-700 leading-tight">
                                        {member.first_name} {member.last_name}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                        {member.relationshipDetail?.relationship_name || member.relationship?.relationship_label || member.relationship?.label || "Family Member"}
                                      </p>
                                      {activeEvac && (
                                        <div className="text-[9px] text-rose-600 font-black uppercase mt-1 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                          Evacuated to: {activeEvac.evacuation_record?.center?.name || activeEvac.evacuation_record?.center?.center_name || activeEvac.evacuationRecord?.center?.name || activeEvac.evacuationRecord?.center?.center_name || activeEvac.evacuation_record?.center_id || activeEvac.evacuationRecord?.center_id || 'Unknown Center'}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Age */}
                                  <div className="w-1/4 text-center text-xs font-medium text-slate-605">
                                    {calculateAge(member.birth_date)}
                                  </div>

                                  {/* GenderBadge */}
                                  <div className="w-1/4 flex justify-end">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-full text-[10px]">
                                      {member.gender?.gender_label || member.gender?.label || "—"}
                                    </span>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Number of Members
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 4"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      value={memberCount}
                      onChange={(e) => setMemberCount(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 font-medium px-1 leading-snug">
                      This household does not have members pre-registered. Specify the count to log details properly.
                    </p>
                  </div>
                )}

                {/* ACCOMMODATION ASSIGNMENT */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Accommodation Assignment
                  </h4>

                  <div className="relative border border-slate-202 rounded-xl px-3 py-2.5 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black text-slate-450 uppercase tracking-widest">
                      Select Unit
                    </label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="w-full bg-white text-xs font-semibold text-slate-705 outline-none border-none py-1 cursor-pointer"
                    >
                      <option value="">Choose available unit...</option>
                      {units.map((unit) => {
                        const available = unit.max_capacity - (unit.current_occupancy || 0);
                        const isFull = available <= 0;
                        
                        // Check if selected members size is larger than available capacity
                        const selectedCount = scannedData?.household?.members?.length > 0 
                          ? selectedMembers.length 
                          : Number(memberCount) || 1;
                        
                        const notEnoughSpace = selectedCount > available;

                        let statusLabel = `${available} slots left`;
                        if (isFull) {
                          statusLabel = "Full";
                        } else if (notEnoughSpace) {
                          statusLabel = `Not enough space - ${available} left`;
                        }

                        return (
                          <option 
                            key={unit.unit_id} 
                            value={unit.unit_id} 
                            disabled={isFull || notEnoughSpace}
                            className="py-1"
                          >
                            {unit.name} ({statusLabel})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

              </div>

              {/* Footer Buttons */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={closeAdmissionModal}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  disabled={loading || (scannedData?.household?.members?.length > 0 ? selectedMembers.length === 0 : !memberCount)}
                  onClick={handleConfirmAdmission}
                  className={`px-5 py-2.5 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    loading || (scannedData?.household?.members?.length > 0 ? selectedMembers.length === 0 : !memberCount)
                      ? "bg-emerald-300 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/10"
                  }`}
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Confirm Admission
                </button>
              </div>

            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
}