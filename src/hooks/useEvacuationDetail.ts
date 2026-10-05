import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getCenter } from '../api/evacuation/getCenter';
import { getUnitsByCenter } from '../api/units/getUnitsByCenter';
import { deleteUnit } from '../api/units/deleteUnit';
import { getUnitAllocations } from '../api/allocations/getUnitAllocations';
import { unassignHousehold } from '../api/allocations/unassignHousehold';
import { getRecordsByCenter } from '../api/evacuationRecords/getRecordsByCenter';
import { deleteRecord } from '../api/evacuationRecords/deleteRecord';
import { exportCenterData, type ExportType } from '../api/evacuationRecords/exportCenterData';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';
import { useAlert } from '../context/AlertContext';

export function useEvacuationDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const activeTab = searchParams.get('tab') || 'units';
    const { showAlert } = useAlert();

    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
    };

    const [selectedEventId, setSelectedEventId] = useState<string>('');

    // Units State & Filters
    const [expandedUnit, setExpandedUnit] = useState<string | number | null>(null);
    const [allocations, setAllocations] = useState<Record<string, any[]>>({});
    const [unitNameFilter, setUnitNameFilter] = useState('');
    const [unitTypeFilter, setUnitTypeFilter] = useState('');
    const [unitStatusFilter, setUnitStatusFilter] = useState('');
    const [selectedUnits, setSelectedUnits] = useState<any[]>([]);
    const [unitsPage, setUnitsPage] = useState(1);

    // Households State & Filters
    const [householdNameFilter, setHouseholdNameFilter] = useState('');
    const [householdContactFilter, setHouseholdContactFilter] = useState('');
    const [householdUnitFilter, setHouseholdUnitFilter] = useState('');
    const [householdMethodFilter, setHouseholdMethodFilter] = useState('');
    const [selectedHouseholds, setSelectedHouseholds] = useState<any[]>([]);
    const [householdPage, setHouseholdPage] = useState(1);

    // Modals & Drawers
    const [viewingUnit, setViewingUnit] = useState<any>(null);
    const [viewingHousehold, setViewingHousehold] = useState<any>(null);
    const [unitModal, setUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<any>(null);
    const [assignModal, setAssignModal] = useState<any>(null);
    const [deleteUnitModal, setDeleteUnitModal] = useState<any>(null);
    const [isDeletingUnit, setIsDeletingUnit] = useState(false);
    const [unassignModal, setUnassignModal] = useState<any>(null);
    const [isUnassigning, setIsUnassigning] = useState(false);
    const [deleteRecordModal, setDeleteRecordModal] = useState<any>(null);
    const [isDeletingRecord, setIsDeletingRecord] = useState(false);

    // Export State
    const [exportDropdown, setExportDropdown] = useState(false);
    const [exporting, setExporting] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    // Permissions
    const canManage = isAdmin() || isSuperAdmin() || isPersonnel();
    const canAdmit = isPersonnel();
    const canEditUnits = isAdmin() || isSuperAdmin();

    // 1. Center Query
    const { data: center = null, isLoading: isCenterLoading } = useQuery<any>({
        queryKey: ['center', id],
        queryFn: async () => {
            if (!id) return null;
            return await getCenter(id);
        },
        enabled: !!id,
    });

    // 2. Units Query
    const { data: unitsResponse = { data: [] } as any, isLoading: isUnitsLoading } = useQuery<any>({
        queryKey: ['centerUnits', id, unitsPage],
        queryFn: async () => {
            if (!id) return { data: [] };
            return await getUnitsByCenter(id, unitsPage, 15);
        },
        enabled: !!id,
        placeholderData: keepPreviousData,
    });

    const units: any[] = unitsResponse?.data || [];
    const unitsMeta = {
        current_page: unitsResponse?.current_page,
        last_page: unitsResponse?.last_page,
        total: unitsResponse?.total,
        from: unitsResponse?.from,
        to: unitsResponse?.to
    };

    // 3. Events Query (Cached)
    const { data: events = [] } = useQuery<any[]>({
        queryKey: ['events'],
        queryFn: async () => {
            const res: any = await getEvents();
            return res.data || res || [];
        },
        staleTime: 1000 * 60 * 2,
    });

    // Sync selectedEventId from center when center loads
    useEffect(() => {
        if (center && !selectedEventId) {
            setSelectedEventId(center.current_event_id || "all");
        }
    }, [center]);

    // 4. Evacuated Households Query
    const { data: householdsResponse = { data: [] } as any, isLoading: householdsLoading } = useQuery<any>({
        queryKey: ['centerHouseholds', id, selectedEventId],
        queryFn: async () => {
            if (!id) return { data: [] };
            const eventParam = selectedEventId === "all" || !selectedEventId ? null : selectedEventId;
            return await getRecordsByCenter(id, null, eventParam);
        },
        enabled: !!id,
    });

    const evacuatedHouseholds: any[] = householdsResponse?.data || [];
    const loading = isCenterLoading || isUnitsLoading;

    // Close export dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                setExportDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Export handler
    const handleExport = async (type: ExportType | string) => {
        if (!id) return;
        setExportDropdown(false);
        setExporting(true);
        try {
            await exportCenterData(id, type as ExportType);
        } catch (err: any) {
            showAlert(err.response?.data?.message || 'Failed to export data.', 'Export Error', 'danger');
        } finally {
            setExporting(false);
        }
    };

    const fetchCenter = () => {
        return queryClient.invalidateQueries({ queryKey: ['center', id] });
    };

    const fetchUnits = (page = unitsPage) => {
        setUnitsPage(page);
        return queryClient.invalidateQueries({ queryKey: ['centerUnits', id] });
    };

    const fetchEvacuatedHouseholds = (eventIdFilter = selectedEventId) => {
        if (eventIdFilter !== selectedEventId) {
            setSelectedEventId(eventIdFilter);
        }
        return queryClient.invalidateQueries({ queryKey: ['centerHouseholds', id] });
    };

    const fetchAllocations = async (unitId: string | number) => {
        try {
            const res = await getUnitAllocations(unitId);
            setAllocations(prev => ({ ...prev, [unitId]: res.data || [] }));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleUnit = async (unitId: string | number) => {
        if (expandedUnit === unitId) {
            setExpandedUnit(null);
        } else {
            setExpandedUnit(unitId);
            await fetchAllocations(unitId);
        }
    };

    // Mutations
    const confirmDeleteUnit = async () => {
        if (!deleteUnitModal || !id) return;
        setIsDeletingUnit(true);
        try {
            await deleteUnit(id, deleteUnitModal.unit_id);
            setDeleteUnitModal(null);
            queryClient.invalidateQueries({ queryKey: ['centerUnits', id] });
            queryClient.invalidateQueries({ queryKey: ['center', id] });
        } catch (err: any) {
            showAlert(err.response?.data?.message || 'Failed to delete unit.', 'Error', 'danger');
        } finally {
            setIsDeletingUnit(false);
        }
    };

    const confirmUnassign = async () => {
        if (!unassignModal) return;
        setIsUnassigning(true);
        try {
            await unassignHousehold(unassignModal.unitId, unassignModal.allocationId);
            fetchAllocations(unassignModal.unitId);
            queryClient.invalidateQueries({ queryKey: ['centerUnits', id] });
            queryClient.invalidateQueries({ queryKey: ['centerHouseholds', id] });
            queryClient.invalidateQueries({ queryKey: ['center', id] });
            setUnassignModal(null);
        } catch (err: any) {
            showAlert(err.response?.data?.message || 'Failed to unassign.', 'Error', 'danger');
        } finally {
            setIsUnassigning(false);
        }
    };

    const confirmDeleteEvacuationRecord = async () => {
        if (!deleteRecordModal) return;
        setIsDeletingRecord(true);
        try {
            await deleteRecord(deleteRecordModal);
            queryClient.invalidateQueries({ queryKey: ['center', id] });
            queryClient.invalidateQueries({ queryKey: ['centerUnits', id] });
            queryClient.invalidateQueries({ queryKey: ['centerHouseholds', id] });
            if (expandedUnit) {
                await fetchAllocations(expandedUnit);
            }
            setDeleteRecordModal(null);
        } catch (err: any) {
            showAlert(err.response?.data?.message || 'Failed to delete evacuation record.', 'Error', 'danger');
        } finally {
            setIsDeletingRecord(false);
        }
    };

    const formatDateTime = (value: string | null | undefined) => {
        if (!value) return '—';
        return new Date(value).toLocaleString();
    };

    // Filter Computations
    const filteredUnits = units.filter(unit => {
        if (unitNameFilter && !`${unit.name} ID-${unit.unit_id}`.toLowerCase().includes(unitNameFilter.toLowerCase())) {
            return false;
        }
        const typeLabel = unit.type?.type_label || 'Standard Unit';
        if (unitTypeFilter && !typeLabel.toLowerCase().includes(unitTypeFilter.toLowerCase())) {
            return false;
        }
        const occupancy = Number(unit.current_occupancy ?? 0);
        const capacity = Number(unit.max_capacity ?? 0);
        const percent = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;
        const isFull = capacity > 0 && occupancy >= capacity;
        const isHigh = percent >= 80 && percent < 100;
        const isAvailable = percent < 80;

        if (unitStatusFilter === "available" && !isAvailable) return false;
        if (unitStatusFilter === "high" && !isHigh) return false;
        if (unitStatusFilter === "full" && !isFull) return false;

        return true;
    });

    const filteredHouseholds = evacuatedHouseholds.filter(record => {
        const isCheckedOut = record.household_status_id === 6 || record.household_status_id === "6" || Number(record.evacuated_count || 0) === 0;
        if (isCheckedOut) {
            return false;
        }

        const nameStr = `${record.household?.household_name || ''} ID-${record.household_id || ''}`.toLowerCase();
        if (householdNameFilter && !nameStr.includes(householdNameFilter.toLowerCase())) {
            return false;
        }
        const contactStr = record.household?.contact_number || '';
        if (householdContactFilter && !contactStr.includes(householdContactFilter)) {
            return false;
        }
        const unitName = record.unit_allocation?.unit?.name || record.unit_allocations?.[0]?.unit?.name || record.unit?.name;
        if (householdUnitFilter === "assigned" && !unitName) return false;
        if (householdUnitFilter === "unassigned" && unitName) return false;
        if (householdUnitFilter && householdUnitFilter !== "assigned" && householdUnitFilter !== "unassigned") {
            if (!unitName || !unitName.toLowerCase().includes(householdUnitFilter.toLowerCase())) return false;
        }
        const methodStr = (record.method || 'manual').toLowerCase();
        if (householdMethodFilter && methodStr !== householdMethodFilter.toLowerCase()) {
            return false;
        }
        return true;
    });

    const householdPerPage = 10;
    const totalHouseholdPages = Math.ceil(filteredHouseholds.length / householdPerPage) || 1;
    const paginatedHouseholds = filteredHouseholds.slice(
        (householdPage - 1) * householdPerPage,
        householdPage * householdPerPage
    );

    return {
        id,
        navigate,
        activeTab,
        setActiveTab,
        center,
        units,
        evacuatedHouseholds,
        events,
        selectedEventId,
        setSelectedEventId,
        loading,
        householdsLoading,

        // Units
        unitsPage,
        unitsMeta,
        filteredUnits,
        expandedUnit,
        allocations,
        unitNameFilter,
        setUnitNameFilter,
        unitTypeFilter,
        setUnitTypeFilter,
        unitStatusFilter,
        setUnitStatusFilter,
        selectedUnits,
        setSelectedUnits,
        toggleUnit,
        fetchUnits,
        fetchAllocations,

        // Households
        householdPage,
        setHouseholdPage,
        totalHouseholdPages,
        filteredHouseholds,
        paginatedHouseholds,
        householdNameFilter,
        setHouseholdNameFilter,
        householdContactFilter,
        setHouseholdContactFilter,
        householdUnitFilter,
        setHouseholdUnitFilter,
        householdMethodFilter,
        setHouseholdMethodFilter,
        selectedHouseholds,
        setSelectedHouseholds,
        fetchEvacuatedHouseholds,

        // Modals & Drawers
        viewingUnit,
        setViewingUnit,
        viewingHousehold,
        setViewingHousehold,
        unitModal,
        setUnitModal,
        editingUnit,
        setEditingUnit,
        assignModal,
        setAssignModal,
        deleteUnitModal,
        setDeleteUnitModal,
        isDeletingUnit,
        unassignModal,
        setUnassignModal,
        isUnassigning,
        deleteRecordModal,
        setDeleteRecordModal,
        isDeletingRecord,

        // Export
        exportDropdown,
        setExportDropdown,
        exporting,
        exportRef,
        handleExport,

        // Permissions
        canManage,
        canAdmit,
        canEditUnits,

        // Mutation Handlers
        confirmDeleteUnit,
        confirmUnassign,
        confirmDeleteEvacuationRecord,
        formatDateTime,
        fetchCenter,
    };
}
