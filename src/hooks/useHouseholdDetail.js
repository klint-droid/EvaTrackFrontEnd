import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getHousehold } from '../api/households/getHousehold';
import { addMember } from '../api/households/addMember';
import { updateMember } from '../api/households/updateMember';
import { deleteMember } from '../api/households/deleteMember';
import { getEvacuationRecord } from '../api/evacuationRecords/getEvacuationRecord';
import { updateMemberEvacuationStatus } from '../api/evacuationRecords/updateMemberEvacuationStatus';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';

export const useHouseholdDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const evacuationIdFromUrl = searchParams.get('evacuation_id');
    const centerIdFromUrl = searchParams.get('center_id');

    const [household, setHousehold] = useState(null);
    const [evacuationContext, setEvacuationContext] = useState(null);
    const [loading, setLoading] = useState(true);
    const [memberModal, setMemberModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [statusUpdatingMemberId, setStatusUpdatingMemberId] = useState(null);
    const [activeEvacTab, setActiveEvacTab] = useState(null);
    const [memberSearch, setMemberSearch] = useState('');
    const [checkInModal, setCheckInModal] = useState({ open: false, member: null });

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const isSuperAdminUser = isSuperAdmin();
    const isAdminUser = isAdmin();
    const isPersonnelUser = isPersonnel();

    const assignedCenterId = currentUser?.assigned_center?.id || currentUser?.assigned_center_id;

    const targetCenterId = centerIdFromUrl ||
                           evacuationContext?.center_id ||
                           evacuationContext?.center?.evacuation_center_id ||
                           household?.current_evacuation?.center_id ||
                           household?.current_evacuation?.center?.evacuation_center_id ||
                           household?.currentEvacuation?.center_id ||
                           household?.currentEvacuation?.center?.evacuation_center_id;

    const povCenterId = isPersonnelUser ? assignedCenterId : targetCenterId;

    const isHouseholdManageable = isSuperAdminUser || isAdminUser ||
        (isPersonnelUser && (!targetCenterId || String(targetCenterId) === String(assignedCenterId)));

    const canEdit = isHouseholdManageable;
    const canDelete = isSuperAdminUser || isAdminUser;
    const isEvacuationContext = !!evacuationIdFromUrl;

    const fetchHousehold = async () => {
        try {
            const res = await getHousehold(id);
            setHousehold(res.data || res);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEvacuationContext = async () => {
        if (!evacuationIdFromUrl) return;
        try {
            const res = await getEvacuationRecord(evacuationIdFromUrl);
            setEvacuationContext(res.data || res);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to load evacuation record.');
        }
    };

    const fetchPageData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchHousehold(), fetchEvacuationContext()]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, [id, evacuationIdFromUrl]);

    const openAdd = () => {
        setEditingMember(null);
        setMemberModal(true);
    };

    const openEdit = (member) => {
        setEditingMember(member);
        setMemberModal(true);
    };

    const handleSave = async (formData) => {
        if (editingMember) {
            await updateMember(id, editingMember.member_id, formData);
        } else {
            await addMember(id, formData);
        }

        await fetchHousehold();

        if (evacuationIdFromUrl) {
            await fetchEvacuationContext();
        }
    };

    const handleDelete = async (memberId) => {
        if (!confirm('Remove this member?')) return;
        try {
            await deleteMember(id, memberId);
            await fetchHousehold();
            if (evacuationIdFromUrl) await fetchEvacuationContext();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove member.');
        }
    };

    const handleMemberStatusChange = async (memberId, status, evacId) => {
        const activeEvacuation = evacId
            ? { evacuation_id: evacId }
            : evacuationContext ||
              household?.current_evacuation ||
              household?.currentEvacuation;

        if (!activeEvacuation?.evacuation_id) {
            alert('No evacuation record selected.');
            return;
        }

        try {
            setStatusUpdatingMemberId(memberId);
            await updateMemberEvacuationStatus(
                activeEvacuation.evacuation_id,
                memberId,
                status
            );
            await fetchHousehold();
            if (evacuationIdFromUrl) await fetchEvacuationContext();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update member evacuation status.');
        } finally {
            setStatusUpdatingMemberId(null);
        }
    };

    const handleBack = () => {
        if (centerIdFromUrl) {
            navigate(`/evacuation-centers/${centerIdFromUrl}`);
            return;
        }
        navigate(-1);
    };

    const allActiveEvacuations = useMemo(() => {
        if (!household) return [];
        const evacsList = household.current_evacuations || household.currentEvacuations || [];
        if (evacsList.length > 0) return evacsList;
        const single = evacuationContext || household.current_evacuation || household.currentEvacuation;
        return single ? [single] : [];
    }, [household, evacuationContext]);

    const isEvacuated = allActiveEvacuations.length > 0;
    const isScattered = allActiveEvacuations.length > 1;

    const personnelEvacuation = useMemo(() => {
        return allActiveEvacuations.find(e => {
            const cId = e.center_id || e.center?.evacuation_center_id;
            return String(cId) === String(assignedCenterId);
        });
    }, [allActiveEvacuations, assignedCenterId]);

    const allEvacuatedMemberIds = useMemo(() => {
        const ids = new Set();
        allActiveEvacuations.forEach(evac => {
            const members = evac.evacuated_members || evac.evacuatedMembers || [];
            members.forEach(em => ids.add(em.member_id));
        });
        return ids;
    }, [allActiveEvacuations]);

    const memberEvacMap = useMemo(() => {
        const map = {};
        allActiveEvacuations.forEach(evac => {
            const centerId = evac.center_id || evac.center?.evacuation_center_id;
            const centerName = evac.center?.name || 'Unknown Center';
            const evacuationId = evac.evacuation_id;
            const members = evac.evacuated_members || evac.evacuatedMembers || [];
            members.forEach(em => {
                map[em.member_id] = {
                    center_id: centerId,
                    center_name: centerName,
                    evacuation_id: evacuationId,
                    verified_at: em.verified_at,
                    verified_by: evac.verifier?.name || evac.verified_by,
                };
            });
        });
        return map;
    }, [allActiveEvacuations]);

    useEffect(() => {
        if (allActiveEvacuations.length > 0 && activeEvacTab === null) {
            const myEvac = allActiveEvacuations.find(e => {
                const cId = e.center_id || e.center?.evacuation_center_id;
                return String(cId) === String(povCenterId);
            });
            setActiveEvacTab(myEvac
                ? (myEvac.center_id || myEvac.center?.evacuation_center_id)
                : (allActiveEvacuations[0].center_id || allActiveEvacuations[0].center?.evacuation_center_id)
            );
        }
    }, [allActiveEvacuations, povCenterId]);

    const filteredMembers = useMemo(() => {
        if (!household?.members) return [];
        if (!memberSearch.trim()) return household.members;
        const q = memberSearch.toLowerCase();
        return household.members.filter(m => {
            const fullName = [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(' ').toLowerCase();
            return fullName.includes(q) || m.member_id?.toLowerCase().includes(q);
        });
    }, [household?.members, memberSearch]);

    const canModifyMember = (memberId) => {
        if (isSuperAdminUser || isAdminUser) return true;
        if (!isPersonnelUser) return false;

        const memberEvac = memberEvacMap[memberId];
        if (!memberEvac) return true;
        return String(memberEvac.center_id) === String(assignedCenterId);
    };

    const getTabMembers = (centerId) => {
        return filteredMembers.filter(m => {
            const evac = memberEvacMap[m.member_id];
            return evac && String(evac.center_id) === String(centerId);
        });
    };

    const unverifiedMembers = filteredMembers.filter(m => !allEvacuatedMemberIds.has(m.member_id));

    const activeTabEvacuation = allActiveEvacuations.find(e => {
        const cId = e.center_id || e.center?.evacuation_center_id;
        return String(cId) === String(activeEvacTab);
    });

    const isMyCenter = (centerId) => String(centerId) === String(assignedCenterId);

    const primaryEvacuation =
        evacuationContext ||
        household?.current_evacuation ||
        household?.currentEvacuation;

    return {
        id,
        navigate,
        household,
        loading,
        memberModal, setMemberModal,
        editingMember,
        statusUpdatingMemberId,
        activeEvacTab, setActiveEvacTab,
        memberSearch, setMemberSearch,
        checkInModal, setCheckInModal,
        
        isSuperAdminUser, isAdminUser, isPersonnelUser,
        povCenterId, canEdit, canDelete, isEvacuationContext,
        
        openAdd, openEdit, handleSave, handleDelete, handleMemberStatusChange, handleBack,
        
        allActiveEvacuations, isEvacuated, isScattered, personnelEvacuation,
        allEvacuatedMemberIds, memberEvacMap, filteredMembers,
        
        canModifyMember, getTabMembers, unverifiedMembers, activeTabEvacuation,
        isMyCenter, primaryEvacuation
    };
};
