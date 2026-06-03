import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Users,
    Plus,
    Trash2,
    Home,
    ChevronDown,
    ChevronUp,
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
import { getCapacity } from '../../api/evacuation/getCapacity';

import { getRecordsByCenter } from '../../api/evacuationRecords/getRecordsByCenter';
import { deleteRecord } from '../../api/evacuationRecords/deleteRecord';
import { exportCenterData } from '../../api/evacuationRecords/exportCenterData';

import UnitModal from '../../components/units/UnitModal';
import AssignHouseholdModal from '../../components/units/AssignHouseholdModal';
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
    const [loading, setLoading] = useState(true);
    const [householdsLoading, setHouseholdsLoading] = useState(false);

    // expanded unit to show allocations
    const [expandedUnit, setExpandedUnit] = useState(null);
    const [allocations, setAllocations] = useState({});

    // modals
    const [unitModal, setUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [assignModal, setAssignModal] = useState(null);

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

    const fetchUnits = async () => {
        try {
            const res = await getUnitsByCenter(id);
            setUnits(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEvacuatedHouseholds = async () => {
        try {
            setHouseholdsLoading(true);
            const res = await getRecordsByCenter(id);
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
            fetchEvacuatedHouseholds(),
        ]);

        setLoading(false);
    };

    useEffect(() => {
        fetchPageData();
    }, [id]);

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

    const handleDeleteUnit = async (unitId) => {
        if (!confirm('Delete this unit?')) return;

        try {
            await deleteUnit(id, unitId);
            fetchUnits();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete unit.');
        }
    };

    const handleUnassign = async (unitId, allocationId) => {
        if (!confirm('Unassign this household?')) return;

        try {
            await unassignHousehold(unitId, allocationId);
            fetchAllocations(unitId);
            fetchUnits();
            fetchEvacuatedHouseholds();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to unassign.');
        }
    };

    const handleDeleteEvacuationRecord = async (evacuationId) => {
        if (
            !confirm(
                'Delete this evacuation record? Use this only if the wrong household was admitted.'
            )
        ) {
            return;
        }

        try {
            await deleteRecord(evacuationId);

            await Promise.all([
                fetchCenter(),
                fetchUnits(),
                fetchEvacuatedHouseholds(),
            ]);

            if (expandedUnit) {
                await fetchAllocations(expandedUnit);
            }

            alert('Evacuation record deleted successfully.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete evacuation record.');
        }
    };

    const formatDateTime = (value) => {
        if (!value) return '—';

        return new Date(value).toLocaleString();
    };

    if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
    if (!center) return <div className="p-6 text-red-500">Center not found.</div>;

    return (
        <div className="p-6 space-y-6">

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
                        <div className="space-y-3">
                            {units.map(unit => {
                                const occupancy = Number(unit.current_occupancy ?? 0);
                                const capacity = Number(unit.max_capacity ?? 0);

                                const percent = capacity > 0
                                    ? Math.round((occupancy / capacity) * 100)
                                    : 0;

                                const isExpanded = expandedUnit === unit.unit_id;

                                return (
                                    <div key={unit.unit_id} className="bg-white rounded-xl border overflow-hidden">

                                        {/* Unit Row */}
                                        <div className="p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Home size={18} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-semibold text-slate-800">{unit.name}</p>

                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {Number(unit.current_occupancy)} / {Number(unit.max_capacity)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">
                                                        {unit.type?.type_label}
                                                    </span>

                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                percent >= 90
                                                                    ? 'bg-red-500'
                                                                    : percent >= 70
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-emerald-500'
                                                            }`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>

                                                    <span className="text-xs font-bold text-slate-600">{percent}%</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {canManage && (
                                                    <button
                                                        onClick={() => setAssignModal(unit)}
                                                        className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
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
                                                            className="px-3 py-1.5 text-xs rounded-lg border hover:bg-slate-50 cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteUnit(unit.unit_id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => toggleUnit(unit.unit_id)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                >
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Allocations */}
                                        {isExpanded && (
                                            <div className="border-t bg-slate-50 p-4">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-3">
                                                    Assigned Households
                                                </p>

                                                {!allocations[unit.unit_id] ? (
                                                    <p className="text-sm text-slate-400">Loading...</p>
                                                ) : allocations[unit.unit_id].length === 0 ? (
                                                    <p className="text-sm text-slate-400">No households assigned yet.</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {allocations[unit.unit_id].map(alloc => (
                                                            <div
                                                                key={alloc.allocation_id}
                                                                className="flex items-center justify-between bg-white p-3 rounded-lg border"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Users size={14} className="text-blue-500" />

                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-700">
                                                                            {alloc.evacuation_record?.household?.household_name}
                                                                        </p>

                                                                        <p className="text-xs text-slate-400">
                                                                            {alloc.evacuation_record?.evacuated_count} people
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {canManage && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleUnassign(
                                                                                unit.unit_id,
                                                                                alloc.allocation_id
                                                                            )
                                                                        }
                                                                        className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                                                                    >
                                                                        Unassign
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                            <button
                                onClick={fetchEvacuatedHouseholds}
                                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-slate-50 cursor-pointer"
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
                                                                    handleDeleteEvacuationRecord(record.evacuation_id)
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
        </div>
    );
}