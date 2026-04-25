import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Plus, Trash2, Home, ChevronDown, ChevronUp } from 'lucide-react';

import { getCenter } from '../../api/evacuation/getCenter';
import { getUnitsByCenter } from '../../api/units/getUnitsByCenter';
import { deleteUnit } from '../../api/units/deleteUnit';
import { getUnitAllocations } from '../../api/allocations/getUnitAllocations';
import { unassignHousehold } from '../../api/allocations/unassignHousehold';

import UnitModal from '../../components/units/UnitModal';
import AssignHouseholdModal from '../../components/units/AssignHouseholdModal';
import { isAdmin, isSuperAdmin, isPersonnel } from '../../utils/roles';

export default function EvacuationDetail() {
    const { id } = useParams();

    const [center, setCenter] = useState(null);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    // expanded unit to show allocations
    const [expandedUnit, setExpandedUnit] = useState(null);
    const [allocations, setAllocations] = useState({});

    // modals
    const [unitModal, setUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [assignModal, setAssignModal] = useState(null); // holds the unit being assigned to

    const canManage = isAdmin() || isSuperAdmin() || isPersonnel();
    const canEditUnits = isAdmin() || isSuperAdmin();

    const fetchCenter = async () => {
        try {
            const res = await getCenter(id);
            setCenter(res.data);
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

    useEffect(() => {
        Promise.all([fetchCenter(), fetchUnits()])
            .finally(() => setLoading(false));
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
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to unassign.');
        }
    };

    if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
    if (!center) return <div className="p-6 text-red-500">Center not found.</div>;

    return (
        <div className="p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{center.name}</h1>
                    <p className="text-sm text-slate-500">{center.address?.full_address}</p>
                </div>
                {canEditUnits && (
                    <button
                        onClick={() => { setEditingUnit(null); setUnitModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Add Unit
                    </button>
                )}
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
                        {units.reduce((sum, u) => sum + (u.current_occupancy || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Units List */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3">Accommodation Units</h2>

                {units.length === 0 ? (
                    <div className="bg-white rounded-xl border p-8 text-center text-slate-400">
                        No units yet. Add one to get started.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {units.map(unit => {
                            const percent = unit.max_capacity
                                ? Math.round((unit.current_occupancy / unit.max_capacity) * 100)
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
                                                    {unit.current_occupancy} / {unit.max_capacity}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400">{unit.type?.type_label}</span>
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            percent >= 90 ? 'bg-red-500' :
                                                            percent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
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
                                                    className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                            {canEditUnits && (
                                                <>
                                                    <button
                                                        onClick={() => { setEditingUnit(unit); setUnitModal(true); }}
                                                        className="px-3 py-1.5 text-xs rounded-lg border hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUnit(unit.unit_id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => toggleUnit(unit.unit_id)}
                                                className="p-1.5 text-slate-400 hover:text-slate-600"
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
                                                                        {alloc.evacuation?.household?.household_name}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400">
                                                                        {alloc.evacuation?.evacuated_count} people
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {canManage && (
                                                                <button
                                                                    onClick={() => handleUnassign(unit.unit_id, alloc.allocation_id)}
                                                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
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

            {/* Modals */}
            {unitModal && (
                <UnitModal
                    centerId={id}
                    unit={editingUnit}
                    units={units}
                    centerCapacity={center.capacity}
                    onClose={() => { setUnitModal(false); setEditingUnit(null); }}
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
                        if (expandedUnit === assignModal.unit_id) {
                            fetchAllocations(assignModal.unit_id);
                        }
                    }}
                />
            )}
        </div>
    );
}