import React, { Fragment } from 'react';
import { Home, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell, StatusBadge, Checkbox } from '../../../ui/Table';
import { TableLayout } from '../../ui/TableLayout';
import { Pagination } from '../../ui/Pagination';

/**
 * Component: UnitsTableTab
 *
 * Adheres to Single Responsibility (SRP) and Interface Segregation (ISP).
 * Responsible for rendering accommodation units, occupancy gauges, selection,
 * expandable inline allocations accordion, and unit action controls.
 */
export default function UnitsTableTab({
    units,
    filteredUnits,
    unitsMeta,
    unitsPage,
    fetchUnits,
    selectedUnits,
    setSelectedUnits,
    canEditUnits,
    canManage,
    unitNameFilter,
    setUnitNameFilter,
    unitStatusFilter,
    setUnitStatusFilter,
    expandedUnit,
    toggleUnit,
    allocations,
    fetchAllocations,
    viewingUnit,
    setViewingUnit,
    setUnitModal,
    setEditingUnit,
    setAssignModal,
    setDeleteUnitModal,
    setUnassignModal,
}) {
    return (
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
                            {canManage && <TableHead className="text-right">Actions</TableHead>}
                        </tr>
                    </TableHeader>
                    <tbody>
                        {filteredUnits.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={canManage ? 6 : 5} className="px-6 py-16 text-center">
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
                                const unitAllocations = allocations[unit.unit_id] ?? unit.unit_allocations ?? unit.unitAllocations ?? [];
                                const isChecked = selectedUnits.includes(unit.unit_id);
                                const isViewing = Boolean(viewingUnit && String(viewingUnit.unit_id) === String(unit.unit_id));

                                return (
                                    <Fragment key={unit.unit_id}>
                                        <TableRow 
                                            isSelected={isChecked || isViewing} 
                                            onClick={() => {
                                                setViewingUnit(unit);
                                                if (!allocations[unit.unit_id]) {
                                                    fetchAllocations(unit.unit_id);
                                                }
                                            }}
                                            className={`cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                                                isViewing ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                                            }`}
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
                                            <TableCell className="text-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleUnit(unit.unit_id);
                                                    }}
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
                                            {canManage && (
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAssignModal(unit);
                                                            }}
                                                            className="px-2.5 py-1 text-xs font-bold rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                                                        >
                                                            Assign
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>

                                        {/* Expandable Chevron Accordion Household Drawer */}
                                        {isExpanded && (
                                            <TableRow>
                                                <TableCell colSpan={canManage ? 6 : 5} className="p-0 border-b-0">
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

                                                        {!allocations[unit.unit_id] && !unit.unit_allocations && !unit.unitAllocations ? (
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
                                                                                    allocationId: alloc.allocation_id,
                                                                                    householdName: alloc.evacuation_record?.household?.household_name || "Household",
                                                                                    unitName: unit.name
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

            {/* ── MOBILE CARD VIEW (below md) ── */}
            <div className="md:hidden p-3 space-y-3">
                {filteredUnits.length === 0 ? (
                    <div className="py-12 text-center">
                        <Home className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={28} />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No accommodation units found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your column filters.</p>
                    </div>
                ) : (
                    filteredUnits.map((unit) => {
                        const occupancy = Number(unit.current_occupancy ?? 0);
                        const capacity = Number(unit.max_capacity ?? 0);
                        const percent = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;
                        const isExpanded = expandedUnit === unit.unit_id;
                        const unitAllocations = allocations[unit.unit_id] ?? unit.unit_allocations ?? unit.unitAllocations ?? [];
                        const isChecked = selectedUnits.includes(unit.unit_id);
                        const isViewing = Boolean(viewingUnit && String(viewingUnit.unit_id) === String(unit.unit_id));

                        return (
                            <div
                                key={unit.unit_id}
                                className={`p-4 bg-white dark:bg-slate-900 rounded-xl border transition-all space-y-3 cursor-pointer ${
                                    isChecked || isViewing
                                        ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 dark:border-blue-500/50"
                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                }`}
                                onClick={() => {
                                    setViewingUnit(unit);
                                    if (!allocations[unit.unit_id]) {
                                        fetchAllocations(unit.unit_id);
                                    }
                                }}
                            >
                                {/* Header: Checkbox + Icon + Unit Info + Status Badge */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div onClick={(e) => e.stopPropagation()}>
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
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center flex-shrink-0">
                                            <Home size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate leading-tight">
                                                {unit.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                                    ID-{unit.unit_id}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                                                    {unit.type?.type_label || 'Room'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div onClick={(e) => e.stopPropagation()}>
                                        <StatusBadge
                                            label={percent >= 100 ? `Full` : percent >= 80 ? `High` : `Available`}
                                            color={percent >= 100 ? "red" : percent >= 80 ? "orange" : "green"}
                                        />
                                    </div>
                                </div>

                                {/* Capacity Bar */}
                                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Capacity & Occupancy</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {occupancy} / {capacity} <span className="font-mono text-slate-400">({percent}%)</span>
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${Math.min(100, percent)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Bottom Action Row */}
                                <div className="flex items-center justify-between pt-1">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleUnit(unit.unit_id);
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            isExpanded
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <Users size={13} />
                                        <span>{unitAllocations.length} Assigned</span>
                                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>

                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAssignModal(unit);
                                            }}
                                            className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50 transition-all cursor-pointer"
                                        >
                                            Assign
                                        </button>
                                    )}
                                </div>

                                {/* Expandable Households Accordion on Mobile */}
                                {isExpanded && (
                                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/80 space-y-2 mt-2">
                                        <div className="flex items-center justify-between px-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Assigned Households ({unitAllocations.length})
                                            </p>
                                            {canManage && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAssignModal(unit)}
                                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    + Assign
                                                </button>
                                            )}
                                        </div>

                                        {unitAllocations.length === 0 ? (
                                            <p className="text-xs text-slate-400 px-1 py-1">No households assigned yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {unitAllocations.map(alloc => (
                                                    <div
                                                        key={alloc.allocation_id}
                                                        className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <Users size={14} className="text-indigo-500 shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                                                    {alloc.evacuation_record?.household?.household_name || "Household"}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400">
                                                                    {alloc.evacuation_record?.evacuated_count || 0} members
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {canManage && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setUnassignModal({
                                                                    unitId: unit.unit_id,
                                                                    allocationId: alloc.allocation_id,
                                                                    householdName: alloc.evacuation_record?.household?.household_name || "Household",
                                                                    unitName: unit.name
                                                                })}
                                                                className="px-2 py-0.5 text-[10px] text-rose-600 hover:bg-rose-50 dark:text-rose-400 rounded font-bold"
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
                    })
                )}
            </div>
        </TableLayout>
    );
}
