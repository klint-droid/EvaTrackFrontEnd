import { useEffect, useState, useRef, Fragment } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Users,
    Plus,
    Trash2,
    Home,
    Search,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Eye,
    RefreshCw,
    UserCheck,
    X,
    ArrowLeft,
    Download,
    FileSpreadsheet,
    Phone,
} from 'lucide-react';

import { getCenter } from '../../api/evacuation/getCenter';
import { getUnitsByCenter } from '../../api/units/getUnitsByCenter';
import { deleteUnit } from '../../api/units/deleteUnit';
import { getUnitAllocations } from '../../api/allocations/getUnitAllocations';
import { unassignHousehold } from '../../api/allocations/unassignHousehold';


import { getRecordsByCenter } from '../../api/evacuationRecords/getRecordsByCenter';
import { deleteRecord } from '../../api/evacuationRecords/deleteRecord';
import { exportCenterData } from '../../api/evacuationRecords/exportCenterData';
import { getEvents } from '../../api/events/getEvents';

import UnitModal from '../../components/units/UnitModal';
import AssignHouseholdModal from '../../components/units/AssignHouseholdModal';
import ViewUnitDrawer from '../../components/units/ViewUnitDrawer';
import ViewEvacuatedHouseholdDrawer from '../../components/evacuation/ViewEvacuatedHouseholdDrawer';
import JiraActionMenu from '../../components/ui/JiraActionMenu';
import AlertConfirmModal from '../../components/AlertConfirmModal';
import { isAdmin, isSuperAdmin, isPersonnel } from '../../utils/roles';
import { useAlert } from '../../context/AlertContext';
import { Table, TableHeader, TableRow, TableHead, TableCell, StatusBadge, Checkbox } from '../../ui/Table';
import { TableLayout } from '../../components/ui/TableLayout';
import { TableTabs } from '../../components/ui/TableTabs';
import { Pagination } from '../../components/ui/Pagination';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';

export default function EvacuationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'units';
    const { showAlert } = useAlert();

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const [center, setCenter] = useState(null);
    const [units, setUnits] = useState([]);
    const [evacuatedHouseholds, setEvacuatedHouseholds] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [loading, setLoading] = useState(true);
    const [householdsLoading, setHouseholdsLoading] = useState(false);

    // expanded unit to show allocations
    const [expandedUnit, setExpandedUnit] = useState(null);
    const [allocations, setAllocations] = useState({});
    const [unitNameFilter, setUnitNameFilter] = useState("");
    const [unitTypeFilter, setUnitTypeFilter] = useState("");
    const [unitStatusFilter, setUnitStatusFilter] = useState("");
    const [selectedUnits, setSelectedUnits] = useState([]);

    const [householdNameFilter, setHouseholdNameFilter] = useState("");
    const [householdContactFilter, setHouseholdContactFilter] = useState("");
    const [householdUnitFilter, setHouseholdUnitFilter] = useState("");
    const [householdMethodFilter, setHouseholdMethodFilter] = useState("");
    const [selectedHouseholds, setSelectedHouseholds] = useState([]);
    const [householdPage, setHouseholdPage] = useState(1);

    // modals & drawers
    const [viewingUnit, setViewingUnit] = useState(null);
    const [viewingHousehold, setViewingHousehold] = useState(null);
    const [unitModal, setUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [deleteUnitModal, setDeleteUnitModal] = useState(null);
    const [isDeletingUnit, setIsDeletingUnit] = useState(false);
    const [unassignModal, setUnassignModal] = useState(null);
    const [isUnassigning, setIsUnassigning] = useState(false);
    const [deleteRecordModal, setDeleteRecordModal] = useState(null);
    const [isDeletingRecord, setIsDeletingRecord] = useState(false);

    // Units Pagination
    const [unitsPage, setUnitsPage] = useState(1);
    const [unitsMeta, setUnitsMeta] = useState(null);

    // export
    const [exportDropdown, setExportDropdown] = useState(false);
    const [exporting, setExporting] = useState(false);
    const exportRef = useRef(null);

    // Close export dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) {
                setExportDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = async (type) => {
        setExportDropdown(false);
        setExporting(true);
        try {
            await exportCenterData(id, type);
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to export data.', 'Export Error', 'danger');
        } finally {
            setExporting(false);
        }
    };

    const canManage = isAdmin() || isSuperAdmin() || isPersonnel();
    const canAdmit = isPersonnel();
    const canEditUnits = isAdmin() || isSuperAdmin();

    const fetchCenter = async () => {
        try {
            const center = await getCenter(id);
            setCenter(center);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUnits = async (page = unitsPage) => {
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

    const fetchAllocations = async (unitId) => {
        try {
            const res = await getUnitAllocations(unitId);
            setAllocations(prev => ({ ...prev, [unitId]: res.data || [] }));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleUnit = async (unitId) => {
        if (expandedUnit === unitId) {
            setExpandedUnit(null);
        } else {
            setExpandedUnit(unitId);
            await fetchAllocations(unitId);
        }
    };

    const confirmDeleteUnit = async () => {
        if (!deleteUnitModal) return;
        setIsDeletingUnit(true);
        try {
            await deleteUnit(id, deleteUnitModal.unit_id);
            setDeleteUnitModal(null);
            fetchUnits();
        } catch (err) {
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
        } catch (err) {
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
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to delete evacuation record.', 'Error', 'danger');
        } finally {
            setIsDeletingRecord(false);
        }
    };

    const formatDateTime = (value) => {
        if (!value) return '—';

        return new Date(value).toLocaleString();
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6 text-left animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col gap-2 items-start">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-200 rounded-full" />
                        <div className="w-48 h-8 bg-slate-200 rounded-lg" />
                        <div className="w-24 h-5 bg-slate-200 rounded-full ml-3" />
                    </div>
                    <div className="w-64 h-4 bg-slate-100 dark:bg-slate-800 rounded-md ml-10" />
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2 shadow-sm dark:shadow-none">
                            <div className="w-24 h-3 bg-slate-200 rounded uppercase" />
                            <div className="w-12 h-8 bg-slate-200 rounded-md" />
                        </div>
                    ))}
                </div>

                {/* Tabs Skeleton */}
                <div className="border-b border-slate-200 dark:border-slate-700 flex space-x-8 pb-4">
                    <div className="w-40 h-6 bg-slate-200 rounded-md" />
                    <div className="w-48 h-6 bg-slate-200 rounded-md" />
                </div>

                {/* Table Area Skeleton */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="space-y-2">
                            <div className="w-48 h-6 bg-slate-200 rounded-md" />
                            <div className="w-64 h-4 bg-slate-100 dark:bg-slate-800 rounded-md" />
                        </div>
                        <div className="w-24 h-9 bg-slate-200 rounded-lg" />
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm dark:shadow-none">
                        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-4 flex gap-8">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-24 h-4 bg-slate-200 rounded-md" />
                            ))}
                        </div>
                        <div className="divide-y divide-slate-100">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="p-4 flex gap-8 items-center">
                                    <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                                    <div className="w-32 h-5 bg-slate-200 rounded-md" />
                                    <div className="w-20 h-5 bg-slate-200 rounded-md" />
                                    <div className="w-16 h-5 bg-slate-200 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (!center) return <div className="p-6 text-red-500">Center not found.</div>;

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

    return (
        <div className="p-6 space-y-6 text-left">

            {/* Header */}
            <div className="flex flex-col gap-0.5 items-start">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => navigate('/evacuation-centers')}
                        className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-full transition-colors cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-50 flex-shrink-0"
                        title="Back to Evacuation Centers"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-none">{center.name}</h1>
                    <span className={`ml-3 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                        center.current_event
                          ? "text-blue-600 bg-blue-50 border-blue-100"
                          : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    }`}>
                        {center.current_event?.name || "No Event Assigned"}
                    </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 pl-10 text-left">
                    {center.osm_address}
                </p>
            </div>

            {/* Center Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Total Capacity</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{center.capacity}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Total Units</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{units.length}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Occupied Slots</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {units.reduce((sum, u) => sum + (parseInt(u.current_occupancy) || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('units')}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'units'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:border-slate-600'
                        }`}
                    >
                        <Home size={16} />
                        Accommodation Units
                        <span className={`ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full transition-all ${
                            activeTab === 'units'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                            {units.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('households')}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'households'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:border-slate-600'
                        }`}
                    >
                        <Users size={16} />
                        Evacuated Households
                        <span className={`ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full transition-all ${
                            activeTab === 'households'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                            {evacuatedHouseholds.length}
                        </span>
                    </button>
                </nav>
            </div>
            {/* Tab Panels */}
            {activeTab === 'units' && (
                <TableLayout
                    title="Accommodation Units"
                    badgeText={`${unitsMeta?.total || units.length} Units`}
                    subtitle="Manage housing structures, room capacities, and household allocations"
                    onAdd={canEditUnits ? () => { setEditingUnit(null); setUnitModal(true); } : undefined}
                    addLabel="Add Unit"
                    selectedCount={selectedUnits.length}
                    onDeleteSelected={canEditUnits && selectedUnits.length > 0 ? () => {
                        selectedUnits.forEach(id => {
                            const target = units.find(u => u.unit_id === id);
                            if (target && Number(target.current_occupancy || 0) === 0) {
                                setDeleteUnitModal(target);
                            }
                        });
                        setSelectedUnits([]);
                    } : undefined}
                    pagination={
                        <Pagination
                            currentPage={unitsPage}
                            totalPages={unitsMeta?.last_page || 1}
                            totalEntries={unitsMeta?.total || units.length}
                            perPage={unitsMeta?.per_page || 15}
                            onPageChange={(page) => fetchUnits(page)}
                        />
                    }
                >
                    {/* Main Table Container */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <tr className="border-b border-gray-100 dark:border-slate-800">
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={filteredUnits.length > 0 && selectedUnits.length === filteredUnits.length}
                                            indeterminate={selectedUnits.length > 0 && selectedUnits.length < filteredUnits.length}
                                            onChange={() => {
                                                if (selectedUnits.length === filteredUnits.length) {
                                                    setSelectedUnits([]);
                                                } else {
                                                    setSelectedUnits(filteredUnits.map(u => u.unit_id));
                                                }
                                            }}
                                            ariaLabel="Select all units"
                                        />
                                    </TableHead>
                                    <TableHead
                                        filterable
                                        filterValue={unitNameFilter}
                                        onFilterChange={setUnitNameFilter}
                                    >
                                        Unit & Type
                                    </TableHead>
                                    <TableHead>
                                        Capacity & Occupancy
                                    </TableHead>
                                    <TableHead
                                        filterable
                                        filterValue={unitStatusFilter}
                                        onFilterChange={setUnitStatusFilter}
                                        filterOptions={[
                                            { value: "available", label: "Available (< 80%)" },
                                            { value: "high", label: "High (80% - 99%)" },
                                            { value: "full", label: "Fully Occupied (100%)" },
                                        ]}
                                    >
                                        Occupancy Status
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Assigned Households
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </tr>
                            </TableHeader>
                            <tbody>
                                {filteredUnits.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan="6" className="px-6 py-16 text-center">
                                            <Home className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={28} />
                                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No accommodation units found</p>
                                            <p className="text-xs text-slate-400 mt-1">Try adjusting your column filters.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUnits.map((unit) => {
                                            const occupancy = Number(unit.current_occupancy ?? 0);
                                            const capacity = Number(unit.max_capacity ?? 0);
                                            const percent = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;
                                            const isExpanded = expandedUnit === unit.unit_id;
                                            const unitAllocations = allocations[unit.unit_id] || [];
                                            const isChecked = selectedUnits.includes(unit.unit_id);

                                            return (
                                                <Fragment key={unit.unit_id}>
                                                    <TableRow 
                                                        isSelected={isChecked} 
                                                        onClick={() => {
                                                            setViewingUnit(unit);
                                                            if (!allocations[unit.unit_id]) {
                                                                fetchAllocations(unit.unit_id);
                                                            }
                                                        }}
                                                        className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                                                    >
                                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onChange={() => {
                                                                    setSelectedUnits(prev => 
                                                                        prev.includes(unit.unit_id) 
                                                                            ? prev.filter(id => id !== unit.unit_id) 
                                                                            : [...prev, unit.unit_id]
                                                                    );
                                                                }}
                                                                ariaLabel={`Select unit ${unit.unit_id}`}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center flex-shrink-0">
                                                                    <Home size={16} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-900 dark:text-slate-100 leading-tight">
                                                                        {unit.name}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-[10px] text-gray-400 dark:text-slate-400 leading-none">
                                                                            ID-{unit.unit_id}
                                                                        </span>
                                                                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                                                                            {unit.type?.type_label || 'Room'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1 w-36">
                                                                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
                                                                    <span className="font-bold text-slate-900 dark:text-white">{occupancy} / {capacity}</span>
                                                                    <span className="text-[10px] text-slate-400 font-mono">{percent}%</span>
                                                                </div>
                                                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={`h-full rounded-full transition-all ${
                                                                            percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                        }`}
                                                                        style={{ width: `${Math.min(100, percent)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                label={percent >= 100 ? `Full (${percent}%)` : percent >= 80 ? `High (${percent}%)` : `Available (${percent}%)`}
                                                                color={percent >= 100 ? "red" : percent >= 80 ? "orange" : "green"}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => toggleUnit(unit.unit_id)}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                                                                    isExpanded
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                                }`}
                                                            >
                                                                <Users size={13} />
                                                                <span>{unitAllocations.length} Assigned</span>
                                                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                            </button>
                                                        </TableCell>
                                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {canManage && (
                                                                    <button
                                                                        onClick={() => setAssignModal(unit)}
                                                                        className="px-2.5 py-1 text-xs font-bold rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                                                                    >
                                                                        Assign
                                                                    </button>
                                                                )}
                                                                <JiraActionMenu
                                                                    onView={() => {
                                                                        setViewingUnit(unit);
                                                                        if (!allocations[unit.unit_id]) {
                                                                            fetchAllocations(unit.unit_id);
                                                                        }
                                                                    }}
                                                                    onDelete={canEditUnits && occupancy === 0 ? () => setDeleteUnitModal(unit) : undefined}
                                                                    canDelete={canEditUnits && occupancy === 0}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Chevron Accordion Household Drawer */}
                                                    {isExpanded && (
                                                        <TableRow>
                                                            <TableCell colSpan="6" className="p-0 border-b-0">
                                                                <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                                                    <div className="flex items-center justify-between mb-3 px-1">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                            Assigned Households in {unit.name} ({unitAllocations.length})
                                                                        </p>
                                                                        {canManage && (
                                                                            <button
                                                                                onClick={() => setAssignModal(unit)}
                                                                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                                                                            >
                                                                                + Assign Household
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {!allocations[unit.unit_id] ? (
                                                                        <p className="text-sm font-medium text-slate-400 px-1">Loading allocations...</p>
                                                                    ) : unitAllocations.length === 0 ? (
                                                                        <p className="text-xs font-medium text-slate-400 px-1">No households assigned yet.</p>
                                                                    ) : (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                                                            {unitAllocations.map(alloc => (
                                                                                <div
                                                                                    key={alloc.allocation_id}
                                                                                    className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                                                                                >
                                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 flex-shrink-0">
                                                                                            <Users size={13} className="text-indigo-600 dark:text-indigo-400" />
                                                                                        </div>
                                                                                        <div className="min-w-0">
                                                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                                                                                                {alloc.evacuation_record?.household?.household_name || "Household"}
                                                                                            </p>
                                                                                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                                                                                {alloc.evacuation_record?.evacuated_count || 0} members
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    {canManage && (
                                                                                        <button
                                                                                            onClick={() => setUnassignModal({
                                                                                                unitId: unit.unit_id,
                                                                                                allocationId: alloc.allocation_id
                                                                                            })}
                                                                                            className="px-2 py-1 text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded font-bold transition-colors"
                                                                                        >
                                                                                            Unassign
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </Fragment>
                                            );
                                        })
                                )}
                            </tbody>
                        </Table>
                    </div>
                </TableLayout>
            )}

            {activeTab === 'households' && (
                <TableLayout
                    title="Evacuated Households"
                    badgeText={`${filteredHouseholds.length} Households`}
                    subtitle="Households currently evacuated and verified in this center"
                    selectedCount={selectedHouseholds.length}
                    onDeleteSelected={canManage && selectedHouseholds.length > 0 ? () => {
                        selectedHouseholds.forEach(id => {
                            setDeleteRecordModal(id);
                        });
                        setSelectedHouseholds([]);
                    } : undefined}
                    onExport={() => setExportDropdown(prev => !prev)}
                    onAdd={canAdmit ? () => navigate('/household-verification') : undefined}
                    addLabel="Admit Household"
                    pagination={
                        <Pagination
                            currentPage={householdPage}
                            totalPages={totalHouseholdPages}
                            totalEntries={filteredHouseholds.length}
                            perPage={10}
                            onPageChange={(page) => setHouseholdPage(page)}
                        />
                    }
                >
                    {/* Main Table Container */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <tr className="border-b border-gray-100 dark:border-slate-800">
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={paginatedHouseholds.length > 0 && selectedHouseholds.length === paginatedHouseholds.length}
                                            indeterminate={selectedHouseholds.length > 0 && selectedHouseholds.length < paginatedHouseholds.length}
                                            onChange={() => {
                                                if (selectedHouseholds.length === paginatedHouseholds.length) {
                                                    setSelectedHouseholds([]);
                                                } else {
                                                    setSelectedHouseholds(paginatedHouseholds.map(r => r.evacuation_id));
                                                }
                                            }}
                                            ariaLabel="Select all households"
                                        />
                                    </TableHead>
                                    <TableHead
                                        filterable
                                        filterValue={householdNameFilter}
                                        onFilterChange={(val) => {
                                            setHouseholdNameFilter(val);
                                            setHouseholdPage(1);
                                        }}
                                    >
                                        Household & ID
                                    </TableHead>
                                    <TableHead
                                        filterable
                                        filterValue={householdContactFilter}
                                        onFilterChange={(val) => {
                                            setHouseholdContactFilter(val);
                                            setHouseholdPage(1);
                                        }}
                                    >
                                        Contact Number
                                    </TableHead>
                                    <TableHead>Evacuees</TableHead>
                                    <TableHead
                                        filterable
                                        filterValue={householdUnitFilter}
                                        onFilterChange={(val) => {
                                            setHouseholdUnitFilter(val);
                                            setHouseholdPage(1);
                                        }}
                                        filterOptions={[
                                            { value: "assigned", label: "Unit Assigned" },
                                            { value: "unassigned", label: "Unassigned" },
                                        ]}
                                    >
                                        Assigned Unit
                                    </TableHead>
                                    <TableHead>Verified On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </tr>
                            </TableHeader>
                            <tbody>
                                {householdsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan="7" className="px-6 py-16 text-center text-slate-400">
                                            Loading evacuated households...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedHouseholds.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan="7" className="px-6 py-16 text-center">
                                            <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={28} />
                                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No evacuated households found</p>
                                            <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or status filter.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedHouseholds.map(record => {
                                        const isChecked = selectedHouseholds.includes(record.evacuation_id);
                                        const unitName = record.unit_allocation?.unit?.name || record.unit_allocations?.[0]?.unit?.name || record.unit?.name;

                                        return (
                                            <TableRow 
                                                key={record.evacuation_id} 
                                                isSelected={isChecked}
                                                onClick={() => setViewingHousehold(record)}
                                                className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            setSelectedHouseholds(prev =>
                                                                prev.includes(record.evacuation_id)
                                                                    ? prev.filter(id => id !== record.evacuation_id)
                                                                    : [...prev, record.evacuation_id]
                                                            );
                                                        }}
                                                        ariaLabel={`Select household ${record.evacuation_id}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center flex-shrink-0">
                                                            <Users size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900 dark:text-slate-100 leading-tight">
                                                                {record.household?.household_name || 'Unnamed Household'}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 dark:text-slate-400 leading-none mt-0.5">
                                                                ID-{record.household_id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 font-mono">
                                                        <Phone size={13} className="text-slate-400" />
                                                        {record.household?.contact_number || '—'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                        {record.evacuated_count || record.household?.member_count || 0} members
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {unitName ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50">
                                                            <Home size={12} />
                                                            {unitName}
                                                        </span>
                                                    ) : (
                                                        <StatusBadge label="Unassigned" color="orange" />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        {formatDateTime(record.verified_at)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <JiraActionMenu
                                                            onView={() => setViewingHousehold(record)}
                                                            onDelete={canManage ? () => setDeleteRecordModal(record.evacuation_id) : undefined}
                                                            canDelete={canManage}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>
                </TableLayout>
            )}

            {/* Slide-In Drawers for Accommodation Unit & Evacuated Household */}
            {viewingUnit && (
                <ViewUnitDrawer
                    unit={viewingUnit}
                    allocations={allocations[viewingUnit.unit_id] || []}
                    onClose={() => setViewingUnit(null)}
                    canManage={canManage}
                    canEdit={canEditUnits}
                    onAssign={(u) => {
                        setViewingUnit(null);
                        setAssignModal(u);
                    }}
                    onUnassign={(unitId, allocId) => {
                        setViewingUnit(null);
                        setUnassignModal({ unitId, allocationId: allocId });
                    }}
                    onEdit={(u) => {
                        setViewingUnit(null);
                        setEditingUnit(u);
                        setUnitModal(true);
                    }}
                    onDelete={(u) => {
                        setViewingUnit(null);
                        setDeleteUnitModal(u);
                    }}
                />
            )}

            {viewingHousehold && (
                <ViewEvacuatedHouseholdDrawer
                    record={viewingHousehold}
                    onClose={() => setViewingHousehold(null)}
                    canManage={canManage}
                    onViewProfile={(r) => {
                        setViewingHousehold(null);
                        navigate(`/households/${r.household_id}?evacuation_id=${r.evacuation_id}&center_id=${id}`);
                    }}
                    onDeleteRecord={(recId) => {
                        setViewingHousehold(null);
                        setDeleteRecordModal(recId);
                    }}
                />
            )}

            {/* Unit Modal */}
            {unitModal && (
                <UnitModal
                    centerId={id}
                    unit={editingUnit}
                    units={units}
                    centerCapacity={center.capacity}
                    onClose={() => {
                        setUnitModal(false);
                        setEditingUnit(null);
                    }}
                    onSaved={fetchUnits}
                />
            )}

            {assignModal && (
                <AssignHouseholdModal
                    centerId={id}
                    unit={assignModal}
                    onClose={() => setAssignModal(null)}
                    onAssigned={() => {
                        fetchUnits();
                        fetchEvacuatedHouseholds();

                        if (expandedUnit === assignModal.unit_id) {
                            fetchAllocations(assignModal.unit_id);
                        }
                    }}
                />
            )}

            <AlertConfirmModal
                isOpen={!!deleteUnitModal}
                onClose={() => setDeleteUnitModal(null)}
                onConfirm={confirmDeleteUnit}
                title="Delete Accommodation Unit"
                message={
                    deleteUnitModal 
                        ? `Are you sure you want to delete the unit "${deleteUnitModal.name}"? This action cannot be undone.`
                        : ''
                }
                confirmText="Delete Unit"
                cancelText="Cancel"
                type="danger"
                isLoading={isDeletingUnit}
            />

            <AlertConfirmModal
                isOpen={!!unassignModal}
                onClose={() => setUnassignModal(null)}
                onConfirm={confirmUnassign}
                title="Unassign Household"
                message="Are you sure you want to unassign this household from the unit? They will be moved to the unassigned list."
                confirmText="Unassign"
                cancelText="Cancel"
                type="warning"
                isLoading={isUnassigning}
            />

            <AlertConfirmModal
                isOpen={!!deleteRecordModal}
                onClose={() => setDeleteRecordModal(null)}
                onConfirm={confirmDeleteEvacuationRecord}
                title="Delete Evacuation Record"
                message="Are you sure you want to delete this evacuation record? Use this only if the wrong household was admitted. This action cannot be undone."
                confirmText="Delete Record"
                cancelText="Cancel"
                type="danger"
                isLoading={isDeletingRecord}
            />
        </div>
    );
}