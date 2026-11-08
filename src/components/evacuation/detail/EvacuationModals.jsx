import React from 'react';
import { Users, Home } from 'lucide-react';
import UnitModal from '../../units/UnitModal';
import AssignHouseholdModal from '../../units/AssignHouseholdModal';
import ViewUnitDrawer from '../../units/ViewUnitDrawer';
import ViewEvacuatedHouseholdDrawer from '../ViewEvacuatedHouseholdDrawer';
import AlertConfirmModal from '../../AlertConfirmModal';

/**
 * Component: EvacuationModals
 *
 * Encapsulates inline right-side detail panels and confirmation modals
 * for the evacuation center detail view.
 */
export default function EvacuationModals({
    id,
    navigate,
    center,
    units = [],
    evacuatedHouseholds = [],
    allocations,
    fetchUnits,
    fetchEvacuatedHouseholds,
    fetchAllocations,

    // Permissions
    canManage,
    canEditUnits,

    // Viewing Drawers
    viewingUnit,
    setViewingUnit,
    viewingHousehold,
    setViewingHousehold,

    // Unit Modal
    unitModal,
    setUnitModal,
    editingUnit,
    setEditingUnit,

    // Assign Household Modal (from Unit tab)
    assignModal,
    setAssignModal,

    // Assign Unit Confirmation (from Household Details Drawer)
    assignUnitModal,
    setAssignUnitModal,
    isAssigningUnit,
    confirmAssignUnit,

    // Delete Unit Confirmation
    deleteUnitModal,
    setDeleteUnitModal,
    isDeletingUnit,
    confirmDeleteUnit,

    // Unassign Confirmation
    unassignModal,
    setUnassignModal,
    isUnassigning,
    confirmUnassign,

    // Delete Record Confirmation
    deleteRecordModal,
    setDeleteRecordModal,
    isDeletingRecord,
    confirmDeleteEvacuationRecord,
}) {
    const deletingRecordObj = deleteRecordModal
        ? evacuatedHouseholds.find((r) => String(r.evacuation_id) === String(deleteRecordModal))
        : null;
    const deletingHouseholdName =
        deletingRecordObj?.household?.household_name || 'this household';

    return (
        <>
            {/* View Unit Inline Right Side Panel */}
            {viewingUnit && (
                <ViewUnitDrawer
                    unit={viewingUnit}
                    allocations={
                        allocations[viewingUnit.unit_id] ??
                        viewingUnit.unit_allocations ??
                        viewingUnit.unitAllocations ??
                        []
                    }
                    onClose={() => setViewingUnit(null)}
                    canManage={canManage}
                    canEdit={canEditUnits}
                    onAssign={(u) => {
                        setAssignModal(u);
                    }}
                    onUnassign={(unitId, allocId, householdName, unitName) => {
                        setUnassignModal({
                            unitId,
                            allocationId: allocId,
                            householdName,
                            unitName,
                        });
                    }}
                    onEdit={(u) => {
                        setEditingUnit(u);
                        setUnitModal(true);
                    }}
                    onDelete={(u) => {
                        setViewingUnit(null);
                        setDeleteUnitModal(u);
                    }}
                />
            )}

            {/* View Evacuated Household Inline Right Side Panel */}
            {viewingHousehold && (
                <ViewEvacuatedHouseholdDrawer
                    record={viewingHousehold}
                    units={units}
                    onClose={() => setViewingHousehold(null)}
                    canManage={canManage}
                    onViewProfile={(r) => {
                        setViewingHousehold(null);
                        navigate(
                            `/households/${r.household_id}?evacuation_id=${r.evacuation_id}&center_id=${id}`
                        );
                    }}
                    onDeleteRecord={(recId) => {
                        setDeleteRecordModal(recId);
                    }}
                    onAssignUnit={(record, targetUnit) => {
                        setAssignUnitModal({
                            record,
                            unit: targetUnit,
                            evacuationId: record.evacuation_id,
                            unitId: targetUnit.unit_id,
                            householdName:
                                record.household?.household_name || 'Evacuated Household',
                            memberCount:
                                record.evacuated_count ||
                                record.household?.member_count ||
                                0,
                            unitName: targetUnit.name,
                            unitType: targetUnit.type?.type_label || 'Room',
                        });
                    }}
                    onUnassignUnit={(unitId, allocationId, householdName, unitName) => {
                        setUnassignModal({
                            unitId,
                            allocationId,
                            householdName,
                            unitName,
                        });
                    }}
                    isAssigningUnit={isAssigningUnit}
                    isUnassigning={isUnassigning}
                    assignConfirmOpen={Boolean(assignUnitModal)}
                    unassignConfirmOpen={Boolean(unassignModal)}
                />
            )}

            {/* Add / Edit Unit Modal */}
            {unitModal && center && (
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

            {/* Assign Household to Unit Modal */}
            {assignModal && (
                <AssignHouseholdModal
                    centerId={id}
                    unit={assignModal}
                    onClose={() => setAssignModal(null)}
                    onAssigned={() => {
                        fetchUnits();
                        fetchEvacuatedHouseholds();
                        fetchAllocations(assignModal.unit_id);
                    }}
                />
            )}

            {/* Assign Room / Unit Confirmation Modal (from Household Details Drawer) */}
            <AlertConfirmModal
                isOpen={!!assignUnitModal}
                onClose={() => setAssignUnitModal(null)}
                onConfirm={confirmAssignUnit}
                title="Assign Accommodation Unit"
                subtitle="Confirm room or unit assignment for this household"
                message={
                    assignUnitModal ? (
                        <>
                            Are you sure you want to assign{' '}
                            <span className="font-black text-slate-900 dark:text-white">
                                {assignUnitModal.householdName}
                            </span>{' '}
                            to{' '}
                            <span className="font-black text-blue-600 dark:text-blue-400">
                                {assignUnitModal.unitName}
                            </span>
                            ?
                        </>
                    ) : (
                        ''
                    )
                }
                confirmText="Confirm Assignment"
                cancelText="Cancel"
                type="info"
                isLoading={isAssigningUnit}
            >
                {assignUnitModal && (
                    <div className="grid grid-cols-1 gap-2.5 pt-1">
                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#141b29] border border-slate-200/80 dark:border-[#1e2a3d]">
                            <div className="flex items-center gap-2 min-w-0">
                                <Users size={14} className="text-slate-400 flex-shrink-0" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Household
                                </span>
                            </div>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate ml-2">
                                {assignUnitModal.householdName} ({assignUnitModal.memberCount}{' '}
                                {assignUnitModal.memberCount === 1 ? 'member' : 'members'})
                            </span>
                        </div>

                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
                            <div className="flex items-center gap-2 min-w-0">
                                <Home size={14} className="text-blue-500 flex-shrink-0" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    Room / Unit
                                </span>
                            </div>
                            <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 truncate ml-2">
                                {assignUnitModal.unitName} ({assignUnitModal.unitType})
                            </span>
                        </div>
                    </div>
                )}
            </AlertConfirmModal>

            {/* Delete Unit Confirmation Modal */}
            <AlertConfirmModal
                isOpen={!!deleteUnitModal}
                onClose={() => setDeleteUnitModal(null)}
                onConfirm={confirmDeleteUnit}
                title="Delete Accommodation Unit"
                subtitle="Permanent unit removal"
                message={
                    deleteUnitModal ? (
                        <>
                            Are you sure you want to delete{' '}
                            <span className="font-black text-slate-900 dark:text-white">
                                {deleteUnitModal.name}
                            </span>
                            ? This action cannot be undone.
                        </>
                    ) : (
                        ''
                    )
                }
                confirmText="Delete Unit"
                cancelText="Cancel"
                type="danger"
                isLoading={isDeletingUnit}
            />

            {/* Unassign Household Confirmation Modal */}
            <AlertConfirmModal
                isOpen={!!unassignModal}
                onClose={() => setUnassignModal(null)}
                onConfirm={confirmUnassign}
                title="Unassign Accommodation Unit"
                subtitle="Remove household from current room or unit"
                message={
                    unassignModal ? (
                        <>
                            Are you sure you want to unassign{' '}
                            <span className="font-black text-slate-900 dark:text-white">
                                {unassignModal.householdName || 'this household'}
                            </span>
                            {unassignModal.unitName ? (
                                <>
                                    {' '}from{' '}
                                    <span className="font-black text-amber-600 dark:text-amber-400">
                                        {unassignModal.unitName}
                                    </span>
                                </>
                            ) : (
                                ' from their assigned unit'
                            )}
                            ? They will be moved back to the unassigned list.
                        </>
                    ) : (
                        ''
                    )
                }
                confirmText="Unassign Household"
                cancelText="Cancel"
                type="warning"
                isLoading={isUnassigning}
            />

            {/* Delete Evacuation Record Confirmation Modal */}
            <AlertConfirmModal
                isOpen={!!deleteRecordModal}
                onClose={() => setDeleteRecordModal(null)}
                onConfirm={confirmDeleteEvacuationRecord}
                title="Delete Evacuation Record"
                subtitle="Permanent evacuation record removal"
                message={
                    <>
                        Are you sure you want to delete the evacuation record for{' '}
                        <span className="font-black text-slate-900 dark:text-white">
                            {deletingHouseholdName}
                        </span>
                        ? Use this only if the wrong household was admitted. This action cannot be undone.
                    </>
                }
                confirmText="Delete Record"
                cancelText="Cancel"
                type="danger"
                isLoading={isDeletingRecord}
            />
        </>
    );
}
