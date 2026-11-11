import React from 'react';
import { Users, Phone, Home } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell, StatusBadge, Checkbox } from '../../../ui/Table';
import { TableLayout } from '../../ui/TableLayout';
import { Pagination } from '../../ui/Pagination';

/**
 * Component: EvacuatedHouseholdsTab
 *
 * Adheres to Single Responsibility (SRP) and Interface Segregation (ISP).
 * Responsible for rendering admitted households, contact information,
 * member counts, assigned units, verification timestamps, and export triggers.
 */
export default function EvacuatedHouseholdsTab({
    filteredHouseholds,
    paginatedHouseholds,
    householdsLoading,
    selectedHouseholds,
    setSelectedHouseholds,
    householdPage,
    setHouseholdPage,
    totalHouseholdPages,
    householdNameFilter,
    setHouseholdNameFilter,
    householdContactFilter,
    setHouseholdContactFilter,
    householdUnitFilter,
    setHouseholdUnitFilter,
    canManage,
    canAdmit,
    canDeleteRecord,
    onAdmit,
    viewingHousehold,
    setViewingHousehold,
    setDeleteRecordModal,
    formatDateTime,
}) {
    return (
        <div className="relative">
            <TableLayout
                title="Evacuated Households"
                badgeText={`${filteredHouseholds.length} Households`}
                subtitle="Households currently evacuated and verified in this center"
                selectedCount={selectedHouseholds.length}
                onDeleteSelected={(canDeleteRecord ?? canManage) && selectedHouseholds.length > 0 ? () => {
                    selectedHouseholds.forEach(id => {
                        setDeleteRecordModal(id);
                    });
                    setSelectedHouseholds([]);
                } : undefined}
                onAdd={canAdmit ? onAdmit : undefined}
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
                            </tr>
                        </TableHeader>
                        <tbody>
                            {householdsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-6 py-16 text-center text-slate-400">
                                        Loading evacuated households...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedHouseholds.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-6 py-16 text-center">
                                        <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={28} />
                                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No evacuated households found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or status filter.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedHouseholds.map(record => {
                                    const isChecked = selectedHouseholds.includes(record.evacuation_id);
                                    const isViewing = viewingHousehold?.evacuation_id === record.evacuation_id;
                                    const unitName = record.unit_allocation?.unit?.name || record.unit_allocations?.[0]?.unit?.name || record.unit?.name;

                                    return (
                                        <TableRow 
                                            key={record.evacuation_id} 
                                            isSelected={isChecked || isViewing}
                                            onClick={() => setViewingHousehold(record)}
                                            className={`cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                                                isViewing ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                                            }`}
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
                                        </TableRow>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </div>

                {/* ── MOBILE CARD VIEW (below md) ── */}
                <div className="md:hidden p-3 space-y-3">
                    {householdsLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse space-y-2.5"
                                >
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40" />
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24" />
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-32" />
                                </div>
                            ))}
                        </div>
                    ) : paginatedHouseholds.length === 0 ? (
                        <div className="py-12 text-center">
                            <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={28} />
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No evacuated households found</p>
                            <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or status filter.</p>
                        </div>
                    ) : (
                        paginatedHouseholds.map(record => {
                            const isChecked = selectedHouseholds.includes(record.evacuation_id);
                            const isViewing = viewingHousehold?.evacuation_id === record.evacuation_id;
                            const unitName = record.unit_allocation?.unit?.name || record.unit_allocations?.[0]?.unit?.name || record.unit?.name;

                            return (
                                <div
                                    key={record.evacuation_id}
                                    className={`p-4 bg-white dark:bg-slate-900 rounded-xl border transition-all space-y-3 cursor-pointer ${
                                        isChecked || isViewing
                                            ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 dark:border-blue-500/50"
                                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                    }`}
                                    onClick={() => setViewingHousehold(record)}
                                >
                                    {/* Top Row: Checkbox, Name, ActionMenu */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div onClick={(e) => e.stopPropagation()}>
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
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center flex-shrink-0">
                                                <Users size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate leading-tight">
                                                    {record.household?.household_name || 'Unnamed Household'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                                    ID-{record.household_id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Row: Evacuee Count & Assigned Unit Badge */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {record.evacuated_count || record.household?.member_count || 0} members
                                            </span>
                                        </div>

                                        <div>
                                            {unitName ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50">
                                                    <Home size={12} />
                                                    {unitName}
                                                </span>
                                            ) : (
                                                <StatusBadge label="Unassigned" color="orange" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom Row: Contact & Verified At */}
                                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                                        <div className="flex items-center gap-1 font-mono text-[11px]">
                                            <Phone size={12} className="text-slate-400" />
                                            <span>{record.household?.contact_number || '—'}</span>
                                        </div>
                                        <span className="text-[11px]">
                                            {formatDateTime(record.verified_at)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </TableLayout>
        </div>
    );
}
