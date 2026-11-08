import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { scanQR } from "../api/evacuationRecords/scanQR";
import { searchHousehold } from "../api/evacuationRecords/searchHousehold";
import { createHousehold } from "../api/evacuationRecords/createHousehold";
import { getCenter } from "../api/evacuation/getCenter";
import { getCenters } from "../api/evacuation/getCenters";
import { admitHousehold } from "../api/evacuationRecords/admitHousehold";
import { getUnitsByCenter } from "../api/units/getUnitsByCenter";
import { assignHousehold } from "../api/allocations/assignHousehold";
import { getLookups } from "../api/lookups/getLookups";
import { useAlert } from "../context/AlertContext";
import { useUserStore } from "../store/useUserStore";
import { clearDashboardCache } from "../pages/Dashboard";
import { clearHouseholdsCache } from "../pages/HouseholdManagement";
import { clearAnalyticsCache } from "../pages/Analytics";

export const useVerifyHousehold = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<string>("admit");
  const [query, setQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<'household' | 'member'>('household');
  const [results, setResults] = useState<any>(undefined);
  const [headName, setHeadName] = useState<string>("");
  const [householdName, setHouseholdName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [walkInMembers, setWalkInMembers] = useState<any[]>([
    {
      id: "head-1",
      first_name: "",
      middle_name: "",
      last_name: "",
      birth_date: "",
      gender_id: "",
      relationship_id: 1, // Head of Household
      civil_status_id: "",
      is_household_head: true,
      is_pwd: false,
      is_pregnant: false,
      vulnerable_group_ids: [],
    }
  ]);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const user = useUserStore((state) => state.user);
  const fetchFreshUser = useUserStore((state) => state.fetchFreshUser);
  const setUser = useUserStore((state) => state.setUser);
  
  const [centerNameOverride, setCenterName] = useState<string | null>(null);
  const [activeCenterId, setActiveCenterId] = useState<string | null>(null);

  const [assignmentModal, setAssignmentModal] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [memberCount, setMemberCount] = useState<string | number>("");
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const { showConfirm, showAlert } = useAlert();

  const addWalkInMember = () => {
    setWalkInMembers(prev => [
      ...prev,
      {
        id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        first_name: "",
        middle_name: "",
        last_name: prev[0]?.last_name || "",
        birth_date: "",
        gender_id: "",
        relationship_id: "",
        civil_status_id: "",
        is_household_head: false,
        is_pwd: false,
        is_pregnant: false,
        vulnerable_group_ids: [],
      }
    ]);
  };

  const removeWalkInMember = (id: string) => {
    setWalkInMembers(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(m => m.id !== id);
    });
  };

  const updateWalkInMember = (id: string, field: string, value: any) => {
    setWalkInMembers(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, [field]: value };
    }));
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

  const isUserAdmin = user?.role === "evac_admin" || user?.role === "super_admin";
  const assignedId = user?.assigned_center?.evacuation_center_id || user?.assigned_center?.id || user?.assigned_center_id;

  // 1. Centers Query (Cached)
  const { data: centers = [] } = useQuery<any[]>({
    queryKey: ['centers'],
    queryFn: async () => {
      const res: any = await getCenters();
      return Array.isArray(res) ? res : (res?.data ?? []);
    },
    enabled: isUserAdmin,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Active Center Query (Cached)
  const { data: activeCenter = null } = useQuery<any>({
    queryKey: ['center', activeCenterId],
    queryFn: async () => {
      if (!activeCenterId) return null;
      const res = await getCenter(activeCenterId);
      const body = getApiBody(res);
      return body?.data || body;
    },
    enabled: !!activeCenterId,
    staleTime: 1000 * 60 * 5,
  });

  // 3. Units for Active Center Query (Cached)
  const { data: units = [] } = useQuery<any[]>({
    queryKey: ['centerUnits', activeCenterId, 'all'],
    queryFn: async () => {
      if (!activeCenterId) return [];
      const res: any = await getUnitsByCenter(activeCenterId, 1, 1000);
      return res.data || [];
    },
    enabled: !!activeCenterId,
  });

  // 4. Lookups Query (Cached)
  const { data: lookups = null } = useQuery<any>({
    queryKey: ['lookups'],
    queryFn: async () => {
      const res = await getLookups();
      return res;
    },
    staleTime: 1000 * 60 * 30,
  });

  const centerName = centerNameOverride || activeCenter?.name || activeCenter?.center_name || activeCenterId || null;
  const records = Array.isArray(results) ? results : (Array.isArray(results?.data) ? results.data : (results?.data?.data || []));

  const showMessage = (msg: string, type: string = "success") => {
    setMessage({
      text: msg || (type === "error" ? "Something went wrong." : "Success."),
      type,
    });
    setTimeout(() => setMessage(null), 3500);
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
      `/households/${household.household_id}?evacuation_id=${evacuation.evacuation_id}&center_id=${evacuation.center_id || activeCenterId || user?.assigned_center?.id || user?.assigned_center_id}`
    );
  };

  useEffect(() => {
    fetchFreshUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!isUserAdmin && assignedId && activeCenterId !== assignedId) {
      setActiveCenterId(assignedId);
      setSelectedUnitId("");
    } else if (assignedId && !activeCenterId) {
      setActiveCenterId(assignedId);
    }
  }, [user, isUserAdmin, assignedId, activeCenterId]);

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
        setSelectedUnitId("");
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
        setSelectedUnitId("");
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

  const handleSearch = async (overrideType?: 'household' | 'member', overrideQuery?: string) => {
    const activeType = overrideType || searchType;
    const raw = overrideQuery !== undefined ? overrideQuery : query;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.length < 1) {
      showMessage("Please enter at least 1 character to search.", "error");
      return;
    }
    setLoading(true);
    try {
      const data = await searchHousehold(trimmed, activeType);
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
    setSelectedUnitId("");
    setModalError(null);
    setAssignmentModal(true);
  };

  const handleVerify = (household: any) => {
    const currentEvac = household?.current_evacuation || household?.currentEvacuation;
    const isEvacuated = currentEvac && (currentEvac.household_status_id === 2 || currentEvac.household_status_id === "2") && !currentEvac.event?.ended_at;
    const evacuated = isEvacuated ? Number(currentEvac.evacuated_count || 0) : 0;
    const total = Math.max(
      Number(household?.members_count || 0),
      Number(household?.member_count || 0),
      Number(household?.members?.length || 0),
      evacuated
    );

    if (isEvacuated && total > 0 && evacuated >= total) {
      showMessage("This household is already 100% evacuated.", "error");
      return;
    }

    openAdmissionModal(household);
  };

  const handleCreate = async () => {
    if (loading) return;

    if (!walkInMembers || walkInMembers.length === 0) {
      showMessage("Please add at least one household member.", "error");
      return;
    }

    const missingFields: string[] = [];
    walkInMembers.forEach((m, idx) => {
      const role = m.is_household_head ? "Head of Household" : `Member #${idx + 1}`;
      if (!m.first_name?.trim()) missingFields.push(`${role} (First Name)`);
      if (!m.last_name?.trim()) missingFields.push(`${role} (Last Name)`);
      if (!m.birth_date) missingFields.push(`${role} (Birth Date)`);
    });

    if (missingFields.length > 0) {
      showMessage(`Please complete: ${missingFields.slice(0, 3).join(", ")}${missingFields.length > 3 ? '...' : ''}`, "error");
      return;
    }

    const effectiveHead = walkInMembers[0];
    const derivedHouseholdName = householdName.trim() || headName.trim() || `${effectiveHead.last_name || 'Walk-In'} Household`;

    const tempHousehold = {
      household_id: "TBD (Walk-In)",
      household_name: derivedHouseholdName,
      contact_number: contactNumber || undefined,
      members: walkInMembers.map((m, idx) => {
        const genObj = lookups?.genders?.find((g: any) => String(g.id) === String(m.gender_id));
        const relObj = lookups?.relationships?.find((r: any) => String(r.id) === String(m.relationship_id));
        const genLabel = genObj?.label || (m.gender_id == 1 ? "Male" : (m.gender_id == 2 ? "Female" : "—"));
        const relLabel = relObj?.label || (m.is_household_head ? "Head of Household" : "Family Member");

        return {
          member_id: `temp-${idx}`,
          first_name: m.first_name,
          middle_name: m.middle_name,
          last_name: m.last_name,
          birth_date: m.birth_date,
          gender_id: m.gender_id,
          gender: {
            gender_label: genLabel,
            label: genLabel,
          },
          relationship_id: m.relationship_id,
          relationshipDetail: {
            relationship_name: relLabel,
          },
          relationship: {
            relationship_label: relLabel,
            label: relLabel,
          },
          civil_status_id: m.civil_status_id,
          is_household_head: m.is_household_head,
          is_pwd: m.is_pwd,
          is_pregnant: m.is_pregnant,
          vulnerable_group_ids: m.vulnerable_group_ids,
        };
      })
    };

    showMessage("Please confirm admission station and allocation details.");
    setScannedData({
      household: tempHousehold,
      isManualNew: true,
      pendingMembers: walkInMembers,
    });
    setSelectedMembers(tempHousehold.members.map((m: any) => m.member_id));
    setMemberCount(walkInMembers.length);
    setSelectedUnitId("");
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
      let finalMemberIds: any[] = [];

      if (scannedData?.isManualNew) {
        const membersToCreate = (scannedData.pendingMembers || scannedData.household?.members || []).map((m: any) => ({
          first_name: m.first_name,
          middle_name: m.middle_name || null,
          last_name: m.last_name,
          birth_date: m.birth_date,
          gender_id: m.gender_id ? Number(m.gender_id) : null,
          relationship_id: m.relationship_id ? Number(m.relationship_id) : (m.is_household_head ? 1 : null),
          civil_status_id: m.civil_status_id ? Number(m.civil_status_id) : null,
          is_household_head: m.is_household_head ? 1 : 0,
          can_report_for_household: m.is_household_head ? 1 : 0,
          is_pwd: m.is_pwd ? 1 : 0,
          is_pregnant: m.is_pregnant ? 1 : 0,
          vulnerable_group_ids: m.vulnerable_group_ids || [],
        }));

        const createRes = await createHousehold({
          household_name: scannedData.household.household_name,
          contact_number: scannedData.household.contact_number,
          members: membersToCreate,
        });
        const payload = getPayload(createRes);
        const createdHousehold = payload?.household || payload?.data || payload;
        finalHouseholdId = createdHousehold?.household_id;

        if (!finalHouseholdId) {
          throw new Error("Failed to create household. No ID returned.");
        }

        const createdMembers = createdHousehold?.members || [];
        const selectedIndices = new Set(
          selectedMembers
            .map((id: any) => (String(id).startsWith('temp-') ? Number(String(id).replace('temp-', '')) : -1))
            .filter((idx: number) => idx >= 0)
        );
        const createdMemberIds =
          selectedIndices.size > 0 && selectedIndices.size < createdMembers.length
            ? createdMembers.filter((_: any, idx: number) => selectedIndices.has(idx)).map((m: any) => m.member_id)
            : createdMembers.map((m: any) => m.member_id);
        if (createdMemberIds.length > 0) {
          finalMemberIds = createdMemberIds;
        }
      }

      let res;
      if (scannedData?.isQR) {
        res = await scanQR({
          household_id: finalHouseholdId,
          member_ids: hasMembers ? selectedMembers : undefined,
          center_id: activeCenterId,
          unit_id: selectedUnitId ? Number(selectedUnitId) : undefined,
        });
      } else {
        const admitIds = finalMemberIds.length > 0
          ? finalMemberIds
          : (hasMembers ? selectedMembers : undefined);

        res = await admitHousehold({
          household_id: finalHouseholdId,
          member_ids: admitIds,
          member_count: (!admitIds || admitIds.length === 0) ? Number(memberCount) : undefined,
          center_id: activeCenterId,
          unit_id: selectedUnitId ? Number(selectedUnitId) : undefined,
        });
      }

      const payload = getPayload(res);
      const evacuation = payload?.evacuation || payload?.record || payload?.evacuation_record || payload;
      const evacuationId = evacuation?.evacuation_id;

      if (selectedUnitId && evacuationId && !evacuation?.unit_allocation && !evacuation?.unitAllocation) {
        try {
          await assignHousehold(selectedUnitId, evacuationId);
        } catch (assignErr: any) {
          const assignErrMsg = assignErr.response?.data?.message || "Unit assignment failed.";
          if (!String(assignErrMsg).toLowerCase().includes("already assigned")) {
            throw new Error(`Admitted successfully, but allocation failed: ${assignErrMsg}`);
          }
        }
      }

      // Synchronize caches across the app
      clearDashboardCache();
      clearHouseholdsCache();
      clearAnalyticsCache();
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      queryClient.invalidateQueries({ queryKey: ['households'] });
      queryClient.invalidateQueries({ queryKey: ['centerHouseholds'] });
      queryClient.invalidateQueries({ queryKey: ['centerUnits'] });
      queryClient.invalidateQueries({ queryKey: ['center'] });
      queryClient.invalidateQueries({ queryKey: ['evacuationRecord'] });

      setAssignmentModal(false);
      setScannedData(null);
      setMemberCount("");
      setSelectedMembers([]);
      setSelectedUnitId("");

      if (scannedData?.isManualNew) {
        setHeadName("");
        setHouseholdName("");
        setContactNumber("");
        setWalkInMembers([
          {
            id: "head-1",
            first_name: "",
            middle_name: "",
            last_name: "",
            birth_date: "",
            gender_id: "",
            relationship_id: 1,
            civil_status_id: "",
            is_household_head: true,
            is_pwd: false,
            is_pregnant: false,
            vulnerable_group_ids: [],
          }
        ]);
      }

      const navPayload = {
         ...payload,
         evacuation,
         household: {
           ...payload?.household,
           household_id: finalHouseholdId
         }
      };

      navigateToHouseholdDetail(navPayload);

      showAlert(
        getMessage(res, "Admission complete."),
        "Success",
        "success"
      );
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
    searchType, setSearchType,
    results, setResults,
    headName, setHeadName,
    householdName, setHouseholdName,
    walkInMembers, setWalkInMembers,
    addWalkInMember, removeWalkInMember, updateWalkInMember,
    lookups,
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
    units, setUnits: () => {},
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
