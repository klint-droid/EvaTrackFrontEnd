import { useEffect, useState, useRef, Fragment } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Users,
    Plus,
    Trash2,
    Home,
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
import AlertConfirmModal from '../../components/AlertConfirmModal';
import { isAdmin, isSuperAdmin, isPersonnel } from '../../utils/roles';

export default function EvacuationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'units';

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

    // modals
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
            alert(err.response?.data?.message || 'Failed to export data.');
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
            alert(err.response?.data?.message || 'Failed to delete unit.');
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
            alert(err.response?.data?.message || 'Failed to unassign.');
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
            alert(err.response?.data?.message || 'Failed to delete evacuation record.');
        } finally {
            setIsDeletingRecord(false);
        }
    };

    const formatDateTime = (value) => {
        if (!value) return '—';

        return new Date(value).toLocaleString();
    };

    if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
    if (!center) return <div className="p-6 text-red-500">Center not found.</div>;

    return (
        <div className="p-6 space-y-6 text-left">

            {/* Header */}
            <div className="flex flex-col gap-0.5 items-start">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => navigate('/evacuation-centers')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-600 hover:text-slate-900 flex-shrink-0"
                        title="Back to Evacuation Centers"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 leading-none">{center.name}</h1>
                    <span className={`ml-3 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                        center.current_event
                          ? "text-blue-600 bg-blue-50 border-blue-100"
                          : "text-slate-500 bg-slate-50 border-slate-200"
                    }`}>
                        {center.current_event?.name || "No Event Assigned"}
                    </span>
                </div>
                <p className="text-sm text-slate-500 pl-10 text-left">
                    {center.osm_address}
                </p>
            </div>

            {/* Center Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Capacity</p>
                    <p className="text-2xl font-black text-slate-800">{center.capacity}</p>
                </div>

                <div className="bg-white rounded-xl border p-4">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Units</p>
                    <p className="text-2xl font-black text-slate-800">{units.length}</p>
                </div>

                <div className="bg-white rounded-xl border p-4">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Occupied Slots</p>
                    <p className="text-2xl font-black text-slate-800">
                        {units.reduce((sum, u) => sum + (parseInt(u.current_occupancy) || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('units')}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'units'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <Home size={16} />
                        Accommodation Units
                        <span className={`ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full transition-all ${
                            activeTab === 'units'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                        }`}>
                            {units.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('households')}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'households'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <Users size={16} />
                        Evacuated Households
                        <span className={`ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full transition-all ${
                            activeTab === 'households'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                        }`}>
                            {evacuatedHouseholds.length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Tab Panels */}
            {activeTab === 'units' && (
                <div className="space-y-4">
                    {/* Tab Header & Action */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Accommodation Units</h2>
                            <p className="text-sm text-slate-500">Manage housing structures and unit allocations.</p>
                        </div>

                        {canEditUnits && (
                            <button
                                onClick={() => {
                                    setEditingUnit(null);
                                    setUnitModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer"
                            >
                                <Plus size={16} />
                                Add Unit
                            </button>
                        )}
                    </div>

                    {/* Units List */}
                    {units.length === 0 ? (
                        <div className="bg-white rounded-xl border p-8 text-center text-slate-400">
                            No units yet. Add one to get started.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs w-[250px]">Unit</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Type</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Capacity</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Occupancy Status</th>
                                            <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase text-xs w-[200px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {units.map(unit => {
                                            const occupancy = Number(unit.current_occupancy ?? 0);
                                            const capacity = Number(unit.max_capacity ?? 0);
                                            const percent = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;
                                            const isExpanded = expandedUnit === unit.unit_id;

                                            return (
                                                <Fragment key={unit.unit_id}>
                                                    <tr className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-100">
                                                                    <Home size={14} />
                                                                </div>
                                                                <p className="font-bold text-slate-800">{unit.name}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-semibold">
                                                                {unit.type?.type_label || 'Unknown'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5 text-sm">
                                                                <Users size={14} className="text-slate-400" />
                                                                <span className="font-bold text-slate-700">{occupancy}</span>
                                                                <span className="text-slate-400">/ {capacity}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2 max-w-[150px]">
                                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all ${
                                                                            percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                        }`}
                                                                        style={{ width: `${percent}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[11px] font-black text-slate-600 w-8">{percent}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {canManage && (
                                                                    <button
                                                                        onClick={() => setAssignModal(unit)}
                                                                        className="px-2.5 py-1.5 text-xs font-bold rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-transparent hover:border-blue-200 transition-all"
                                                                    >
                                                                        Assign
                                                                    </button>
                                                                )}
                                                                {canEditUnits && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingUnit(unit);
                                                                                setUnitModal(true);
                                                                            }}
                                                                            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded transition-colors"
                                                                            title="Edit Unit"
                                                                        >
                                                                            <Edit2 size={15} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDeleteUnitModal(unit)}
                                                                            disabled={occupancy > 0}
                                                                            title={occupancy > 0 ? "Cannot delete unit with occupants" : "Delete unit"}
                                                                            className={`p-1.5 rounded transition-colors ${
                                                                                occupancy > 0 
                                                                                    ? 'text-slate-200 cursor-not-allowed' 
                                                                                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                                                                            }`}
                                                                        >
                                                                            <Trash2 size={15} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    onClick={() => toggleUnit(unit.unit_id)}
                                                                    className={`p-1.5 rounded transition-colors ${isExpanded ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                                                                    title={isExpanded ? "Hide allocations" : "Show allocations"}
                                                                >
                                                                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {isExpanded && (
                                                        <tr>
                                                            <td colSpan="5" className="p-0 border-b-0">
                                                                <div className="bg-slate-50 border-t border-slate-100 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                                                        Assigned Households
                                                                    </p>

                                                                    {!allocations[unit.unit_id] ? (
                                                                        <p className="text-sm font-medium text-slate-400 px-1">Loading allocations...</p>
                                                                    ) : allocations[unit.unit_id].length === 0 ? (
                                                                        <p className="text-sm font-medium text-slate-400 px-1">No households assigned yet.</p>
                                                                    ) : (
                                                                        <div className="space-y-2 max-w-2xl">
                                                                            {allocations[unit.unit_id].map(alloc => (
                                                                                <div
                                                                                    key={alloc.allocation_id}
                                                                                    className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                                                                                >
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                                                                            <Users size={14} className="text-indigo-500" />
                                                                                        </div>

                                                                                        <div>
                                                                                            <p className="text-sm font-bold text-slate-800 leading-tight">
                                                                                                {alloc.evacuation_record?.household?.household_name}
                                                                                            </p>

                                                                                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                                                                                {alloc.evacuation_record?.evacuated_count} members
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    {canManage && (
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                setUnassignModal({
                                                                                                    unitId: unit.unit_id,
                                                                                                    allocationId: alloc.allocation_id
                                                                                                })
                                                                                            }
                                                                                            className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md font-bold transition-colors border border-transparent hover:border-red-100"
                                                                                        >
                                                                                            Unassign
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {unitsMeta && unitsMeta.last_page > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        <button 
                                            onClick={() => fetchUnits(unitsPage - 1)} 
                                            disabled={unitsPage === 1} 
                                            className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button 
                                            onClick={() => fetchUnits(unitsPage + 1)} 
                                            disabled={unitsPage === unitsMeta.last_page} 
                                            className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-slate-700">
                                                Showing <span className="font-bold">{unitsMeta.from || 0}</span> to <span className="font-bold">{unitsMeta.to || 0}</span> of <span className="font-bold">{unitsMeta.total || 0}</span> units
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                <button
                                                    onClick={() => fetchUnits(unitsPage - 1)}
                                                    disabled={unitsPage === 1}
                                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                                >
                                                    <span className="sr-only">Previous</span>
                                                    <ChevronLeft size={16} aria-hidden="true" />
                                                </button>
                                                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-offset-0">
                                                    Page {unitsPage} of {unitsMeta.last_page}
                                                </span>
                                                <button
                                                    onClick={() => fetchUnits(unitsPage + 1)}
                                                    disabled={unitsPage === unitsMeta.last_page}
                                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                                >
                                                    <span className="sr-only">Next</span>
                                                    <ChevronRight size={16} aria-hidden="true" />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'households' && (
                <div className="space-y-4">
                    {/* Tab Header & Actions */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Evacuated Households</h2>
                            <p className="text-sm text-slate-500">
                                Households currently evacuated and verified in this center.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Event Filter Dropdown */}
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                            >
                                <option value="all">All Events</option>
                                {events.map(evt => (
                                    <option key={evt.event_id} value={evt.event_id}>
                                        {evt.name} {evt.ended_at ? "(Ended)" : "(Active)"}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => fetchEvacuatedHouseholds(selectedEventId)}
                                className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold border rounded-xl hover:bg-slate-50 cursor-pointer"
                            >
                                <RefreshCw size={15} />
                                Refresh
                            </button>

                            {/* Export CSV Dropdown */}
                            <div className="relative" ref={exportRef}>
                                <button
                                    onClick={() => setExportDropdown(prev => !prev)}
                                    disabled={exporting || evacuatedHouseholds.length === 0}
                                    className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exporting ? (
                                        <RefreshCw size={15} className="animate-spin" />
                                    ) : (
                                        <Download size={15} />
                                    )}
                                    {exporting ? 'Exporting...' : 'Export CSV'}
                                    <ChevronDown size={14} />
                                </button>

                                {exportDropdown && (
                                    <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl border shadow-lg z-50 overflow-hidden">
                                        <div className="px-3 py-2 bg-slate-50 border-b">
                                            <p className="text-xs font-bold text-slate-500 uppercase">Export Type</p>
                                        </div>
                                        <button
                                            onClick={() => handleExport('household')}
                                            className="w-full flex items-start gap-3 px-3 py-3 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                                        >
                                            <FileSpreadsheet size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Household Summary</p>
                                                <p className="text-xs text-slate-400">1 row per household — overview with unit and contact info</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleExport('member')}
                                            className="w-full flex items-start gap-3 px-3 py-3 hover:bg-slate-50 transition-colors cursor-pointer text-left border-t"
                                        >
                                            <Users size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Member Detail</p>
                                                <p className="text-xs text-slate-400">1 row per member — includes age, gender, vulnerabilities</p>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {canAdmit && (
                                <button
                                    onClick={() => navigate('/household-verification')}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 cursor-pointer"
                                >
                                    <UserCheck size={16} />
                                    Admit Household
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">
                                            Household
                                        </th>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">
                                            Contact
                                        </th>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">
                                            Members
                                        </th>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">
                                            Unit
                                        </th>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">
                                            Method
                                        </th>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">
                                            Verified At
                                        </th>
                                        <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase text-xs">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {householdsLoading ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                                Loading evacuated households...
                                            </td>
                                        </tr>
                                    ) : evacuatedHouseholds.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                                No evacuated households yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        evacuatedHouseholds.map(record => (
                                            <tr
                                                key={record.evacuation_id}
                                                className="border-b last:border-b-0 hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {record.household?.household_name || 'Unnamed Household'}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {record.household_id}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-slate-600">
                                                    {record.household?.contact_number || '—'}
                                                </td>

                                                <td className="px-4 py-3 text-slate-600">
                                                    {record.evacuated_count || record.household?.member_count || 0}
                                                </td>

                                                <td className="px-4 py-3 text-slate-600">
                                                    {record.unit_allocations?.[0]?.unit?.name || (
                                                        <span className="text-amber-600 font-medium">Unassigned</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-slate-600 capitalize">
                                                    {record.method || 'manual'}
                                                </td>

                                                <td className="px-4 py-3 text-slate-600">
                                                    {formatDateTime(record.verified_at)}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/households/${record.household_id}?evacuation_id=${record.evacuation_id}&center_id=${id}`
                                                                )
                                                            }
                                                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border hover:bg-slate-50 cursor-pointer"
                                                        >
                                                            <Eye size={13} />
                                                            View/Edit
                                                        </button>

                                                        {canManage && (
                                                            <button
                                                                onClick={() =>
                                                                    setDeleteRecordModal(record.evacuation_id)
                                                                }
                                                                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                                                            >
                                                                <Trash2 size={13} />
                                                                Delete Record
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
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