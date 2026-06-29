import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, AlertCircle, CheckCircle2 } from "lucide-react";

import { scanQR } from "../api/evacuationRecords/scanQR";
import { searchHousehold } from "../api/evacuationRecords/searchHousehold";
import { createHousehold } from "../api/evacuationRecords/createHousehold";
import { getUser } from "../api/auth/getUser";
import { getCenter } from "../api/evacuation/getCenter";
import { admitHousehold } from "../api/evacuationRecords/admitHousehold";
import { getUnitsByCenter } from "../api/units/getUnitsByCenter";
import { assignHousehold } from "../api/allocations/assignHousehold";

import VerifyHouseholdTabs from "../components/verifyHousehold/VerifyHouseholdTabs";
import RegistrySearch from "../components/verifyHousehold/RegistrySearch";
import ManualEntry from "../components/verifyHousehold/ManualEntry";
import QrScannerModal from "../components/verifyHousehold/QrScannerModal";
import AdmissionModal from "../components/verifyHousehold/AdmissionModal";

export default function VerifyHousehold() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("admit"); // "admit" = Search Registry, "manual" = New On-site entry
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(undefined); // undefined indicates search has not run yet
  const [headName, setHeadName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
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

    getUnitsByCenter(user.assigned_center_id, 1, 1000)
      .then((res) => {
        setUnits(res.data || []);
      })
      .catch(console.error);
  }, [user]);

  const handleScan = async (rawScan) => {
    let householdId = rawScan;
    let qrParsed = null;
    try {
      let parsed = JSON.parse(rawScan);
      if (parsed && typeof parsed === "object") {
        if (parsed.household_id) {
          try {
            const nested = JSON.parse(parsed.household_id);
            if (nested && typeof nested === "object" && nested.household_id) {
              parsed = nested;
            }
          } catch {
            // ignore
          }
        }
        
        if (parsed.household_id) {
          householdId = parsed.household_id;
          qrParsed = parsed;
        }
      }
    } catch {
      // plain string
    }

    setLoading(true);

    try {
      const res = await searchHousehold(householdId);
      const recordsList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.data || []));
      const household = recordsList.find(h => h.household_id === householdId) || recordsList[0];

      if (household) {
        setScannedData({
          household,
          isQR: true
        });
        setMemberCount(household?.member_count || 1);
        const memberIds = Array.isArray(household?.members) 
          ? household.members.filter(m => !getActiveEvacuation(m)).map(m => m.member_id) 
          : [];
        setSelectedMembers(memberIds);
        showMessage("QR scanned successfully. Confirm admission below.");
        setModalError(null);
        setAssignmentModal(true);
      } else {
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
    setScannedData({ household });
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
      const res = await createHousehold({ 
        household_name: headName,
        contact_number: contactNumber || undefined,
      });
      const payload = getPayload(res);
      const household = payload?.household || payload?.data || payload;

      if (!household?.household_id) {
        showMessage("Household admitted, but response is missing household ID.", "error");
        return;
      }

      showMessage("Household admitted. Confirm final count.");
      setScannedData({ household });
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
      const errMsg = err.response?.data?.message || err.message || "Admission failed.";
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
    const r = member?.evacuated_members || member?.evacuatedMembers || [];
    return r.find(em => {
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
        <VerifyHouseholdTabs tab={tab} setTab={setTab} />

        {tab === "admit" && (
          <RegistrySearch
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            setQrModalOpen={setQrModalOpen}
            loading={loading}
            results={results}
            records={records}
            getHeadName={getHeadName}
            handleVerify={handleVerify}
          />
        )}

        {tab === "manual" && (
          <ManualEntry
            headName={headName}
            setHeadName={setHeadName}
            contactNumber={contactNumber}
            setContactNumber={setContactNumber}
            memberCount={memberCount}
            setMemberCount={setMemberCount}
            handleCreate={handleCreate}
            loading={loading}
          />
        )}
      </div>

      <QrScannerModal
        qrModalOpen={qrModalOpen}
        setQrModalOpen={setQrModalOpen}
        handleScan={handleScan}
        setTab={setTab}
      />

      <AdmissionModal
        assignmentModal={assignmentModal}
        closeAdmissionModal={closeAdmissionModal}
        modalError={modalError}
        scannedData={scannedData}
        getActiveEvacuation={getActiveEvacuation}
        selectedMembers={selectedMembers}
        setSelectedMembers={setSelectedMembers}
        calculateAge={calculateAge}
        memberCount={memberCount}
        setMemberCount={setMemberCount}
        selectedUnitId={selectedUnitId}
        setSelectedUnitId={setSelectedUnitId}
        units={units}
        loading={loading}
        handleConfirmAdmission={handleConfirmAdmission}
      />
    </div>
  );
}