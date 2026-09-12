import React from 'react';
import UnitModal from '../../units/UnitModal';
import AssignHouseholdModal from '../../units/AssignHouseholdModal';
import ViewUnitDrawer from '../../units/ViewUnitDrawer';
import ViewEvacuatedHouseholdDrawer from '../ViewEvacuatedHouseholdDrawer';
import AlertConfirmModal from '../../AlertConfirmModal';

/**
 * Component: EvacuationModals
 *
 * Adheres to Single Responsibility Principle (SRP).
 * Encapsulates all drawer overlays and confirmation dialogs
 * for the evacuation center detail view.
 */
export default function EvacuationModals({
    id,
    navigate,
    center,
    units,
    expandedUnit,
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

    // Assign Modal
    assignModal,
    setAssignModal,

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
    return (
        <>
            {/* View Unit Slide-In Drawer */}
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

            {/* View Evacuated Household Slide-In Drawer */}
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
                        if (expandedUnit === assignModal.unit_id) {
                            fetchAllocations(assignModal.unit_id);
                        }
                    }}
                />
            )}

            {/* Delete Unit Confirmation Modal */}
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

            {/* Unassign Household Confirmation Modal */}
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

            {/* Delete Evacuation Record Confirmation Modal */}
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
        </>
    );
}
