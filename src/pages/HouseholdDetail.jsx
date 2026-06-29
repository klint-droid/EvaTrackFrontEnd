import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, XCircle } from 'lucide-react';

import { getHousehold } from '../api/households/getHousehold';
import { addMember } from '../api/households/addMember';
import { updateMember } from '../api/households/updateMember';
import { deleteMember } from '../api/households/deleteMember';
import { getEvacuationRecord } from '../api/evacuationRecords/getEvacuationRecord';
import { updateMemberEvacuationStatus } from '../api/evacuationRecords/updateMemberEvacuationStatus';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';

import MemberModal from '../components/households/MemberModal';
import HouseholdHeader from '../components/households/HouseholdHeader';
import HouseholdStats from '../components/households/HouseholdStats';
import EvacueeList from '../components/households/EvacueeList';
import CheckInModal from '../components/households/CheckInModal';

export default function HouseholdDetail() {
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

    // The personnel's OWN assigned center — this is the key to fixing the POV
    const assignedCenterId = currentUser?.assigned_center?.id || currentUser?.assigned_center_id;

    // For backwards compatibility with URL-based navigation
    const targetCenterId = centerIdFromUrl ||
                           evacuationContext?.center_id ||
                           evacuationContext?.center?.evacuation_center_id ||
                           household?.current_evacuation?.center_id ||
                           household?.current_evacuation?.center?.evacuation_center_id ||
                           household?.currentEvacuation?.center_id ||
                           household?.currentEvacuation?.center?.evacuation_center_id;

    // Use assignedCenterId for personnel POV, targetCenterId for admin/fallback
    const povCenterId = isPersonnelUser ? assignedCenterId : targetCenterId;

    const isHouseholdManageable = isSuperAdminUser || isAdminUser ||
        (isPersonnelUser && (!targetCenterId || String(targetCenterId) === String(assignedCenterId)));

    const canEdit = isHouseholdManageable;
    const canDelete = isSuperAdminUser || isAdminUser;
    const isEvacuationContext = !!evacuationIdFromUrl;

    // ─── Fetchers ─────────────────────────────────────────────────────

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

    // ─── Modal Handlers ───────────────────────────────────────────────

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

    // ─── Other Handlers ───────────────────────────────────────────────

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

    // ─── Derived Data ─────────────────────────────────────────────────

    // Build the list of all active evacuations across all centers
    const allActiveEvacuations = useMemo(() => {
        if (!household) return [];

        // Prefer the new plural relationship
        const evacsList = household.current_evacuations || household.currentEvacuations || [];

        if (evacsList.length > 0) return evacsList;

        // Fallback: single evacuation from context or currentEvacuation
        const single = evacuationContext || household.current_evacuation || household.currentEvacuation;
        return single ? [single] : [];
    }, [household, evacuationContext]);

    const isEvacuated = allActiveEvacuations.length > 0;
    const isScattered = allActiveEvacuations.length > 1;

    // Find personnel's evacuation record for this household
    const personnelEvacuation = useMemo(() => {
        return allActiveEvacuations.find(e => {
            const cId = e.center_id || e.center?.evacuation_center_id;
            return String(cId) === String(assignedCenterId);
        });
    }, [allActiveEvacuations, assignedCenterId]);

    // Build a Set of all evacuated member IDs across all centers
    const allEvacuatedMemberIds = useMemo(() => {
        const ids = new Set();
        allActiveEvacuations.forEach(evac => {
            const members = evac.evacuated_members || evac.evacuatedMembers || [];
            members.forEach(em => ids.add(em.member_id));
        });
        return ids;
    }, [allActiveEvacuations]);

    // Build a map: member_id → { center_id, center_name, evacuation_id, verified_at }
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

    // Set default active tab to personnel's center (if they have one there) or first tab
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

    // Filter members based on search
    const filteredMembers = useMemo(() => {
        if (!household?.members) return [];
        if (!memberSearch.trim()) return household.members;
        const q = memberSearch.toLowerCase();
        return household.members.filter(m => {
            const fullName = [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(' ').toLowerCase();
            return fullName.includes(q) || m.member_id?.toLowerCase().includes(q);
        });
    }, [household?.members, memberSearch]);

    // ─── Permission Helpers ───────────────────────────────────────────

    const canModifyMember = (memberId) => {
        if (isSuperAdminUser || isAdminUser) return true;
        if (!isPersonnelUser) return false;

        const memberEvac = memberEvacMap[memberId];
        // If member is not evacuated anywhere, personnel at any center can check them in
        if (!memberEvac) return true;
        // If member is at personnel's assigned center, they can modify
        return String(memberEvac.center_id) === String(assignedCenterId);
    };

    // ─── Guards ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="animate-spin" size={36} />
                    <p className="text-xs font-bold uppercase tracking-widest">Loading household...</p>
                </div>
            </div>
        );
    }

    if (!household) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <XCircle size={48} className="text-red-200 mb-4" />
                <p className="text-base font-black text-slate-700 mb-1">Household Not Found</p>
                <p className="text-xs text-slate-400 mb-6">
                    This household does not exist or you don&apos;t have access to it.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Members for the active tab
    const getTabMembers = (centerId) => {
        return filteredMembers.filter(m => {
            const evac = memberEvacMap[m.member_id];
            return evac && String(evac.center_id) === String(centerId);
        });
    };

    const unverifiedMembers = filteredMembers.filter(m => !allEvacuatedMemberIds.has(m.member_id));

    // Active tab evacuation record
    const activeTabEvacuation = allActiveEvacuations.find(e => {
        const cId = e.center_id || e.center?.evacuation_center_id;
        return String(cId) === String(activeEvacTab);
    });

    const isMyCenter = (centerId) => String(centerId) === String(assignedCenterId);

    // ─── Primary evacuation for the status card ──────────────────────
    const primaryEvacuation =
        evacuationContext ||
        household.current_evacuation ||
        household.currentEvacuation;

    // ─── Render ───────────────────────────────────────────────────────

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-left">
            <HouseholdHeader 
                household={household}
                isEvacuationContext={isEvacuationContext}
                isEvacuated={isEvacuated}
                isScattered={isScattered}
                handleBack={handleBack}
            />

            <HouseholdStats 
                household={household}
                isEvacuated={isEvacuated}
                isScattered={isScattered}
                allActiveEvacuations={allActiveEvacuations}
                primaryEvacuation={primaryEvacuation}
                allEvacuatedMemberIds={allEvacuatedMemberIds}
            />

            <EvacueeList 
                household={household}
                isEvacuated={isEvacuated}
                isPersonnelUser={isPersonnelUser}
                isSuperAdminUser={isSuperAdminUser}
                isAdminUser={isAdminUser}
                memberSearch={memberSearch}
                setMemberSearch={setMemberSearch}
                canEdit={canEdit}
                openAdd={openAdd}
                allActiveEvacuations={allActiveEvacuations}
                activeEvacTab={activeEvacTab}
                setActiveEvacTab={setActiveEvacTab}
                unverifiedMembers={unverifiedMembers}
                isMyCenter={isMyCenter}
                getTabMembers={getTabMembers}
                activeTabEvacuation={activeTabEvacuation}
                filteredMembers={filteredMembers}
                memberEvacMap={memberEvacMap}
                canModifyMember={canModifyMember}
                povCenterId={povCenterId}
                statusUpdatingMemberId={statusUpdatingMemberId}
                setCheckInModal={setCheckInModal}
                personnelEvacuation={personnelEvacuation}
                handleMemberStatusChange={handleMemberStatusChange}
                openEdit={openEdit}
                canDelete={canDelete}
                handleDelete={handleDelete}
                allEvacuatedMemberIds={allEvacuatedMemberIds}
            />

            <CheckInModal 
                checkInModal={checkInModal}
                setCheckInModal={setCheckInModal}
                isPersonnelUser={isPersonnelUser}
                personnelEvacuation={personnelEvacuation}
                statusUpdatingMemberId={statusUpdatingMemberId}
                handleMemberStatusChange={handleMemberStatusChange}
                allActiveEvacuations={allActiveEvacuations}
            />

            {/* Member Modal */}
            <MemberModal
                open={memberModal}
                onClose={() => setMemberModal(false)}
                onSave={handleSave}
                editingMember={editingMember}
            />
        </div>
    );
}