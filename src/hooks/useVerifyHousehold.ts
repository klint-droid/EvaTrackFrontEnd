import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scanQR } from "../api/evacuationRecords/scanQR";
import { searchHousehold } from "../api/evacuationRecords/searchHousehold";
import { createHousehold } from "../api/evacuationRecords/createHousehold";
import { getUser } from "../api/auth/getUser";
import { getCenter } from "../api/evacuation/getCenter";
import { getCenters } from "../api/evacuation/getCenters";
import { isAdmin, isSuperAdmin } from "../utils/roles";
import { admitHousehold } from "../api/evacuationRecords/admitHousehold";
import { getUnitsByCenter } from "../api/units/getUnitsByCenter";
import { assignHousehold } from "../api/allocations/assignHousehold";
import { useAlert } from "../context/AlertContext";

export const useVerifyHousehold = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState<string>("admit");
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any>(undefined);
  const [headName, setHeadName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [user, setUser] = useState<any>(null);
  const [centerName, setCenterName] = useState<string | null>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [activeCenterId, setActiveCenterId] = useState<string | null>(null);

  const [assignmentModal, setAssignmentModal] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [memberCount, setMemberCount] = useState<string | number>("");
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const { showConfirm } = useAlert();

  const records = Array.isArray(results) ? results : (Array.isArray(results?.data) ? results.data : (results?.data?.data || []));

  const showMessage = (msg: string, type: string = "success") => {
    setMessage({
      text: msg || (type === "error" ? "Something went wrong." : "Success."),
      type,
    });
    setTimeout(() => setMessage(null), 3500);
  };

  const getApiBody = (res: any) => {
    if (res?.data?.message || res?.data?.data) {
      return res.data;
    }
    return res;
  };

  const getPayload = (res: any) => {
    const body = getApiBody(res);
    return body?.data || body;
  };

  const getMessage = (res: any, fallback: string = "Success.") => {
    const body = getApiBody(res);
    return body?.message || fallback;
  };

  const getActiveEvacuation = (member: any) => {
    const r = member?.evacuated_members || member?.evacuatedMembers || [];
    return r.find((em: any) => {
      const record = em.evacuation_record || em.evacuationRecord;
      return record && 
        (record.household_status_id === 2 || record.household_status_id === '2') && 
        !record.event?.ended_at;
    });
  };

  const navigateToHouseholdDetail = (payload: any) => {
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
      `/households/${household.household_id}?evacuation_id=${evacuation.evacuation_id}&center_id=${evacuation.center_id || activeCenterId || user?.assigned_center_id}`
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
    if (!user) return;
    const isUserAdmin = isAdmin() || isSuperAdmin();

    if (isUserAdmin) {
      getCenters()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : (res?.data ?? []);
          setCenters(list);
          // Only set activeCenterId if the admin has a specifically assigned center, 
          // otherwise leave it null so they are forced to choose in the Admission Modal.
          if (user.assigned_center_id && !activeCenterId) {
            setActiveCenterId(user.assigned_center_id);
          }
        })
        .catch(console.error);
    } else if (user.assigned_center_id && !activeCenterId) {
      setActiveCenterId(user.assigned_center_id);
    }
  }, [user]);

  useEffect(() => {
    if (!activeCenterId) return;

    getCenter(activeCenterId)
      .then((res) => {
        const body = getApiBody(res);
        const center = body?.data || body;
        setCenterName(
          center?.name || center?.center_name || activeCenterId
        );
      })
      .catch(() => {
        setCenterName(activeCenterId);
      });

    getUnitsByCenter(activeCenterId, 1, 1000)
      .then((res: any) => {
        setUnits(res.data || []);
      })
      .catch(console.error);
  }, [activeCenterId]);

  const handleScan = async (rawScan: string) => {
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
      const res: any = await searchHousehold(householdId);
      const recordsList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.data || []));
      const household = recordsList.find((h: any) => h.household_id === householdId) || recordsList[0];

      if (household) {
        setScannedData({
          household,
          isQR: true
        });
        setMemberCount(household?.member_count || 1);
        const memberIds = Array.isArray(household?.members) 
          ? household.members.filter((m: any) => !getActiveEvacuation(m)).map((m: any) => m.member_id) 
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
    } catch (err: any) {
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
    } catch (err: any) {
      showMessage(err.response?.data?.message || "Search failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAdmissionModal = (household: any) => {
    setScannedData({ household });
    setMemberCount(household?.member_count || 1);
    const memberIds = Array.isArray(household?.members) 
      ? household.members.filter((m: any) => !getActiveEvacuation(m)).map((m: any) => m.member_id) 
      : [];
    setSelectedMembers(memberIds);
    setModalError(null);
    setAssignmentModal(true);
  };

  const handleVerify = (household: any) => {
    openAdmissionModal(household);
  };

  const handleCreate = async () => {
    if (loading) return;
    if (!headName.trim() || !memberCount || Number(memberCount) <= 0) {
      showMessage("Please enter household name and number of members.", "error");
      return;
    }

    const tempHousehold = {
      household_id: "TBD",
      household_name: headName,
      contact_number: contactNumber || undefined,
      members: []
    };

    showMessage("Please confirm admission details.");
    setScannedData({ household: tempHousehold, isManualNew: true });
    setModalError(null);
    setAssignmentModal(true);
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
    if (!activeCenterId) {
      setModalError("You must select an active evacuation center.");
      return;
    }
    if (!scannedData?.household?.household_id) {
      setModalError("No household selected.");
      return;
    }

    setModalError(null);
    setLoading(true);

    try {
      let finalHouseholdId = scannedData?.household?.household_id;

      if (scannedData?.isManualNew) {
        const createRes = await createHousehold({
          household_name: scannedData.household.household_name,
          contact_number: scannedData.household.contact_number,
        });
        const payload = getPayload(createRes);
        const createdHousehold = payload?.household || payload?.data || payload;
        finalHouseholdId = createdHousehold?.household_id;

        if (!finalHouseholdId) {
            throw new Error("Failed to create household. No ID returned.");
        }
      }

      let res;
      if (scannedData?.isQR) {
        res = await scanQR({
          household_id: finalHouseholdId,
          member_ids: hasMembers ? selectedMembers : undefined,
          center_id: activeCenterId,
        });
      } else {
        res = await admitHousehold({
          household_id: finalHouseholdId,
          member_ids: hasMembers ? selectedMembers : undefined,
          member_count: !hasMembers ? Number(memberCount) : undefined,
          center_id: activeCenterId,
        });
      }

      const payload = getPayload(res);
      const evacuation = payload?.evacuation || payload?.record || payload?.evacuation_record || payload;
      const evacuationId = evacuation?.evacuation_id;

      if (selectedUnitId && evacuationId) {
        try {
          await assignHousehold(selectedUnitId, evacuationId);
        } catch (assignErr: any) {
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

      if (scannedData?.isManualNew) {
        setHeadName("");
        setContactNumber("");
      }

      const navPayload = {
         ...payload,
         household: {
           ...payload?.household,
           household_id: finalHouseholdId
         }
      };

      navigateToHouseholdDetail(navPayload);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Admission failed.";
      setModalError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const closeAdmissionModal = () => {
    if (scannedData?.household) {
      showConfirm(
        "Household is not yet admitted. Close anyway?",
        () => {
          setAssignmentModal(false);
          setScannedData(null);
          setSelectedMembers([]);
          setModalError(null);
          setSelectedUnitId("");
        },
        "Close Anyway",
        "warning",
        "Close"
      );
      return;
    }
    setAssignmentModal(false);
    setScannedData(null);
    setSelectedMembers([]);
    setModalError(null);
    setSelectedUnitId("");
  };

  const getHeadName = (h: any) => {
    if (!h.members || h.members.length === 0) return 'Not Specified';
    const head = h.members.find((m: any) => 
      m.relationship?.relationship_key === 'head' || 
      m.relationship?.relationship_label === 'Head of Household' ||
      m.relationship_id === 1
    );
    return head ? `${head.first_name} ${head.last_name}` : 'Not Specified';
  };

  const calculateAge = (birthDate: string) => {
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

  return {
    tab, setTab,
    query, setQuery,
    results, setResults,
    headName, setHeadName,
    contactNumber, setContactNumber,
    message, setMessage,
    loading, setLoading,
    user, setUser,
    centerName, setCenterName,
    centers, activeCenterId, setActiveCenterId,
    assignmentModal, setAssignmentModal,
    qrModalOpen, setQrModalOpen,
    scannedData, setScannedData,
    memberCount, setMemberCount,
    selectedMembers, setSelectedMembers,
    modalError, setModalError,
    units, setUnits,
    selectedUnitId, setSelectedUnitId,
    records,
    handleScan,
    handleSearch,
    openAdmissionModal,
    handleVerify,
    handleCreate,
    handleConfirmAdmission,
    closeAdmissionModal,
    getHeadName,
    calculateAge,
    getActiveEvacuation,
  };
};
