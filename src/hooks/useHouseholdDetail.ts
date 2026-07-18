import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getHousehold } from '../api/households/getHousehold';
import { addMember } from '../api/households/addMember';
import { updateMember } from '../api/households/updateMember';
import { deleteMember } from '../api/households/deleteMember';
import { getEvacuationRecord } from '../api/evacuationRecords/getEvacuationRecord';
import { updateMemberEvacuationStatus } from '../api/evacuationRecords/updateMemberEvacuationStatus';
import { getUser as fetchUserApi } from '../api/auth/getUser';
import { useAlert } from '../context/AlertContext';

export const useHouseholdDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const evacuationIdFromUrl: string | null = searchParams.get('evacuation_id');
    const centerIdFromUrl: string | null = searchParams.get('center_id');

    const [household, setHousehold] = useState<any>(null);
    const [evacuationContext, setEvacuationContext] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [memberModal, setMemberModal] = useState<boolean>(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [statusUpdatingMemberId, setStatusUpdatingMemberId] = useState<string | number | null>(null);
    const [activeEvacTab, setActiveEvacTab] = useState<string | number | null>(null);
    const [memberSearch, setMemberSearch] = useState<string>('');
    const [checkInModal, setCheckInModal] = useState<{ open: boolean, member: any }>({ open: false, member: null });
    const { showAlert, showConfirm } = useAlert();

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const [user, setUser] = useState<any>(currentUser);

    const isSuperAdminUser: boolean = user?.role === 'super_admin';
    const isAdminUser: boolean = user?.role === 'evac_admin';
    const isPersonnelUser: boolean = user?.role === 'evac_personnel';

    const assignedCenterId = user?.assigned_center?.id || user?.assigned_center_id;

    useEffect(() => {
        fetchUserApi()
            .then((res: any) => {
                const body = res.data?.data || res.data || res;
                const freshUser = body.data || body;
                if (freshUser) {
                    const normalizedUser = {
                        ...freshUser,
                        role: freshUser.role?.role_key || freshUser.role,
                        role_label: freshUser.role?.role_name || freshUser.role_label,
                        assigned_center: freshUser.assigned_center ? {
                            id: freshUser.assigned_center.evacuation_center_id || freshUser.assigned_center.id,
                            name: freshUser.assigned_center.name,
                        } : (freshUser.assigned_center_id ? { id: freshUser.assigned_center_id } : null),
                    };
                    setUser(normalizedUser);
                    localStorage.setItem("user", JSON.stringify(normalizedUser));
                }
            })
            .catch(console.error);
    }, []);

    const targetCenterId = centerIdFromUrl ||
                           evacuationContext?.center_id ||
                           evacuationContext?.center?.evacuation_center_id ||
                           household?.current_evacuation?.center_id ||
                           household?.current_evacuation?.center?.evacuation_center_id ||
                           household?.currentEvacuation?.center_id ||
                           household?.currentEvacuation?.center?.evacuation_center_id;

    const povCenterId = isPersonnelUser ? assignedCenterId : targetCenterId;

    const isHouseholdManageable: boolean = isSuperAdminUser || isAdminUser ||
        (isPersonnelUser && (!targetCenterId || String(targetCenterId) === String(assignedCenterId)));

    const canEdit: boolean = isHouseholdManageable;
    const canDelete: boolean = isSuperAdminUser || isAdminUser;
    const isEvacuationContext: boolean = !!evacuationIdFromUrl;

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
        } catch (err: any) {
            console.error(err);
            showAlert(err.response?.data?.message || 'Failed to load evacuation record.', 'Error', 'danger');
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

    const openEdit = (member: any) => {
        setEditingMember(member);
        setMemberModal(true);
    };

    const handleSave = async (formData: any) => {
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

    const handleDelete = async (memberId: string | number) => {
        showConfirm(
            'Remove this member?',
            async () => {
                try {
                    await deleteMember(id as string, String(memberId));
                    await fetchHousehold();
                    if (evacuationIdFromUrl) await fetchEvacuationContext();
                } catch (err: any) {
                    showAlert(err.response?.data?.message || 'Failed to remove member.', 'Error', 'danger');
                }
            },
            'Remove Member',
            'danger',
            'Remove'
        );
    };

    const handleMemberStatusChange = async (memberId: string | number, status: string, evacId?: string | number) => {
        const activeEvacuation = evacId
            ? { evacuation_id: evacId }
            : evacuationContext ||
              household?.current_evacuation ||
              household?.currentEvacuation;

        if (!activeEvacuation?.evacuation_id) {
            showAlert('No evacuation record selected.', 'Error', 'danger');
            return;
        }

        try {
            setStatusUpdatingMemberId(memberId);
            await updateMemberEvacuationStatus(
                String(activeEvacuation.evacuation_id),
                String(memberId),
                status as any
            );
            await fetchHousehold();
            if (evacuationIdFromUrl) await fetchEvacuationContext();
        } catch (err: any) {
            showAlert(err.response?.data?.message || 'Failed to update member evacuation status.', 'Error', 'danger');
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

    const allActiveEvacuations = useMemo<any[]>(() => {
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

    const allEvacuatedMemberIds = useMemo<Set<string | number>>(() => {
        const ids = new Set<string | number>();
        allActiveEvacuations.forEach(evac => {
            const members = evac.evacuated_members || evac.evacuatedMembers || [];
            members.forEach((em: any) => {
                if (em.member_id) {
                    ids.add(em.member_id);
                }
            });
        });
        return ids;
    }, [allActiveEvacuations]);

    const memberEvacMap = useMemo<{ [key: string]: any }>(() => {
        const map: { [key: string]: any } = {};
        allActiveEvacuations.forEach(evac => {
            const centerId = evac.center_id || evac.center?.evacuation_center_id;
            const centerName = evac.center?.name || 'Unknown Center';
            const evacuationId = evac.evacuation_id;
            const members = evac.evacuated_members || evac.evacuatedMembers || [];
            members.forEach((em: any) => {
                if (em.member_id) {
                    map[em.member_id] = {
                        center_id: centerId,
                        center_name: centerName,
                        evacuation_id: evacuationId,
                        verified_at: em.verified_at,
                        verified_by: evac.verifier?.name || evac.verified_by,
                    };
                }
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

    const filteredMembers = useMemo<any[]>(() => {
        if (!household?.members) return [];
        if (!memberSearch.trim()) return household.members;
        const q = memberSearch.toLowerCase();
        return household.members.filter((m: any) => {
            const fullName = [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(' ').toLowerCase();
            return fullName.includes(q) || m.member_id?.toString().toLowerCase().includes(q);
        });
    }, [household?.members, memberSearch]);

    const canModifyMember = (memberId: string | number) => {
        if (isSuperAdminUser || isAdminUser) return true;
        if (!isPersonnelUser) return false;

        const memberEvac = memberEvacMap[memberId];
        if (!memberEvac) return true;
        return String(memberEvac.center_id) === String(assignedCenterId);
    };

    const getTabMembers = (centerId: string | number) => {
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

    const isMyCenter = (centerId: string | number) => String(centerId) === String(assignedCenterId);

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
