import React from 'react';
import { Users, Phone, Home, Download, FileSpreadsheet } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell, StatusBadge, Checkbox } from '../../../ui/Table';
import { TableLayout } from '../../ui/TableLayout';
import { Pagination } from '../../ui/Pagination';
import ActionMenu from '../../ui/ActionMenu';

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
    onAdmit,
    exportDropdown,
    setExportDropdown,
    exportRef,
    handleExport,
    exporting,
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
                onDeleteSelected={canManage && selectedHouseholds.length > 0 ? () => {
                    selectedHouseholds.forEach(id => {
                        setDeleteRecordModal(id);
                    });
                    setSelectedHouseholds([]);
                } : undefined}
                onExport={() => setExportDropdown(prev => !prev)}
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
                                <TableHead className="text-right">Actions</TableHead>
                            </tr>
                        </TableHeader>
                        <tbody>
                            {householdsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                        Loading evacuated households...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedHouseholds.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-6 py-16 text-center">
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
                                                    <ActionMenu
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

            {/* Export Dropdown Menu */}
            {exportDropdown && (
                <div
                    ref={exportRef}
                    className="absolute right-6 top-16 z-30 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 animate-in fade-in zoom-in-95 duration-100"
                >
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={exporting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <FileSpreadsheet size={15} className="text-emerald-600" />
                        <span>Export as Excel (.xlsx)</span>
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <Download size={15} className="text-rose-600" />
                        <span>Export as PDF</span>
                    </button>
                </div>
            )}
        </div>
    );
}
