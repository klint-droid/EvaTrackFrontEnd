import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCenter } from '../api/evacuation/getCenter';
import { getUnitsByCenter } from '../api/units/getUnitsByCenter';
import { deleteUnit } from '../api/units/deleteUnit';
import { getUnitAllocations } from '../api/allocations/getUnitAllocations';
import { unassignHousehold } from '../api/allocations/unassignHousehold';
import { getRecordsByCenter } from '../api/evacuationRecords/getRecordsByCenter';
import { deleteRecord } from '../api/evacuationRecords/deleteRecord';
import { exportCenterData } from '../api/evacuationRecords/exportCenterData';
import { getEvents } from '../api/events/getEvents';
import { isAdmin, isSuperAdmin, isPersonnel } from '../utils/roles';
import { useAlert } from '../context/AlertContext';

/**
 * Custom Hook: useEvacuationDetail
 *
 * Adheres to Single Responsibility Principle (SRP).
 * Encapsulates all data fetching, filtering, pagination, modal state,
 * and mutations for the Evacuation Detail view.
 */
export function useEvacuationDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'units';
    const { showAlert } = useAlert();

    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
    };

    // Center & Event Data
    const [center, setCenter] = useState<any>(null);
    const [units, setUnits] = useState<any[]>([]);
    const [evacuatedHouseholds, setEvacuatedHouseholds] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [householdsLoading, setHouseholdsLoading] = useState(false);

    // Units State & Filters
    const [expandedUnit, setExpandedUnit] = useState<string | number | null>(null);
    const [allocations, setAllocations] = useState<Record<string, any[]>>({});
    const [unitNameFilter, setUnitNameFilter] = useState('');
    const [unitTypeFilter, setUnitTypeFilter] = useState('');
    const [unitStatusFilter, setUnitStatusFilter] = useState('');
    const [selectedUnits, setSelectedUnits] = useState<any[]>([]);
    const [unitsPage, setUnitsPage] = useState(1);
    const [unitsMeta, setUnitsMeta] = useState<any>(null);

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
    const handleExport = async (type: string) => {
        if (!id) return;
        setExportDropdown(false);
        setExporting(true);
        try {
            await exportCenterData(id, type);
        } catch (err: any) {
            showAlert(err.response?.data?.message || 'Failed to export data.', 'Export Error', 'danger');
        } finally {
            setExporting(false);
        }
    };

    // Data Fetchers
    const fetchCenter = async () => {
        if (!id) return;
        try {
            const data = await getCenter(id);
            setCenter(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUnits = async (page = unitsPage) => {
        if (!id) return;
        try {
            const res = await getUnitsByCenter(id, page, 15);
            setUnits(res.data || []);
            setUnitsMeta({
                current_page: res.current_page,
                last_page: res.last_page,
                total: res.total,
                from: res.from,
                to: res.to
            });
            setUnitsPage(page);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await getEvents();
            setEvents(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEvacuatedHouseholds = async (eventIdFilter = selectedEventId) => {
        if (!id) return;
        try {
            setHouseholdsLoading(true);
            const eventParam = eventIdFilter === "all" || !eventIdFilter ? null : eventIdFilter;
            const res = await getRecordsByCenter(id, null, eventParam);
            setEvacuatedHouseholds(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setHouseholdsLoading(false);
        }
    };

    const fetchPageData = async () => {
        await Promise.all([
            fetchCenter(),
            fetchUnits(),
            fetchEvents(),
        ]);
        setLoading(false);
    };

    useEffect(() => {
        fetchPageData();
    }, [id]);

    useEffect(() => {
        if (center) {
            setSelectedEventId(center.current_event_id || "all");
        }
    }, [center]);

    useEffect(() => {
        if (selectedEventId) {
            fetchEvacuatedHouseholds(selectedEventId);
        }
    }, [selectedEventId]);

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
            fetchUnits();
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
            fetchUnits();
            fetchEvacuatedHouseholds();
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
            await Promise.all([
                fetchCenter(),
                fetchUnits(),
                fetchEvacuatedHouseholds(),
            ]);
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
