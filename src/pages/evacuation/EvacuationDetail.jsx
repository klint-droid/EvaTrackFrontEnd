import React from 'react';
import { Home, Users } from 'lucide-react';
import ResourceNotFound from '../../components/ui/ResourceNotFound';
import { useEvacuationDetail } from '../../hooks/useEvacuationDetail';
import EvacuationHeader from '../../components/evacuation/detail/EvacuationHeader';
import EvacuationStats from '../../components/evacuation/detail/EvacuationStats';
import UnitsTableTab from '../../components/evacuation/detail/UnitsTableTab';
import EvacuatedHouseholdsTab from '../../components/evacuation/detail/EvacuatedHouseholdsTab';
import EvacuationModals from '../../components/evacuation/detail/EvacuationModals';

/**
 * Page: EvacuationDetail
 *
 * Adheres to SOLID Principles:
 * - Single Responsibility (SRP): Orchestrates high-level layout. All business logic,
 *   state, and API mutations live in useEvacuationDetail hook; display lives in focused sub-components.
 * - Open-Closed (OCP): New tabs or stats can be added without altering existing tab implementations.
 * - Interface Segregation (ISP): Props passed to subcomponents are segregated and minimal.
 */
export default function EvacuationDetail() {
    const {
        id,
        navigate,
        activeTab,
        setActiveTab,
        center,
        units,
        evacuatedHouseholds,
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
        assignUnitModal,
        setAssignUnitModal,
        isAssigningUnit,
        confirmAssignUnit,
        deleteUnitModal,
        setDeleteUnitModal,
        isDeletingUnit,
        unassignModal,
        setUnassignModal,
        isUnassigning,
        deleteRecordModal,
        setDeleteRecordModal,
        isDeletingRecord,

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
    } = useEvacuationDetail();

    // Keep open drawers synced with live query data
    const activeViewingUnit = viewingUnit
        ? units.find((u) => u.unit_id === viewingUnit.unit_id) ?? viewingUnit
        : null;

    const activeViewingHousehold = viewingHousehold
        ? evacuatedHouseholds.find((r) => r.evacuation_id === viewingHousehold.evacuation_id) ?? viewingHousehold
        : null;

    const hasOpenDrawer = Boolean(activeViewingUnit || activeViewingHousehold);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-left animate-pulse">
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

                {/* Table Area Skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                    <div className="w-48 h-6 bg-slate-200 rounded-md" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-full h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!center) {
        return (
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                <ResourceNotFound
                    title="Evacuation Center Not Found"
                    message="This evacuation center could not be located or may have been deactivated."
                    backUrl="/evacuation-centers"
                    backLabel="Back to Evacuation Centers"
                    onRetry={fetchCenter}
                />
            </div>
        );
    }

    return (
        <div className="flex items-start min-h-[calc(100vh-3.5rem)] font-sans text-left relative">
            {/* ─── Left Column: Main Content (shifts left when detail panel is open) ─── */}
            <div
                className={`flex-1 min-w-0 p-4 sm:p-6 pb-24 lg:pb-8 space-y-6 transition-all duration-300 ${
                    hasOpenDrawer ? 'max-w-none' : 'max-w-6xl mx-auto'
                }`}
            >
                {/* Header Identity & Event Badge */}
                <EvacuationHeader
                    center={center}
                    onBack={() => navigate('/evacuation-centers')}
                />

                {/* Capacity & Occupancy Stats */}
                <EvacuationStats
                    center={center}
                    units={units}
                    evacuatedHouseholds={filteredHouseholds}
                />

                {/* Tabs Navigation */}
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => {
                                setViewingHousehold(null);
                                setActiveTab('units');
                            }}
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
                            onClick={() => {
                                setViewingUnit(null);
                                setActiveTab('households');
                            }}
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
                                {filteredHouseholds.length}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Tab Panel: Accommodation Units */}
                {activeTab === 'units' && (
                    <UnitsTableTab
                        units={units}
                        filteredUnits={filteredUnits}
                        unitsMeta={unitsMeta}
                        unitsPage={unitsPage}
                        fetchUnits={fetchUnits}
                        selectedUnits={selectedUnits}
                        setSelectedUnits={setSelectedUnits}
                        canEditUnits={canEditUnits}
                        canManage={canManage}
                        unitNameFilter={unitNameFilter}
                        setUnitNameFilter={setUnitNameFilter}
                        unitStatusFilter={unitStatusFilter}
                        setUnitStatusFilter={setUnitStatusFilter}
                        expandedUnit={expandedUnit}
                        toggleUnit={toggleUnit}
                        allocations={allocations}
                        fetchAllocations={fetchAllocations}
                        viewingUnit={activeViewingUnit}
                        setViewingUnit={(u) => {
                            setViewingHousehold(null);
                            setViewingUnit(u);
                        }}
                        setUnitModal={setUnitModal}
                        setEditingUnit={setEditingUnit}
                        setAssignModal={setAssignModal}
                        setDeleteUnitModal={setDeleteUnitModal}
                        setUnassignModal={setUnassignModal}
                    />
                )}

                {/* Tab Panel: Evacuated Households */}
                {activeTab === 'households' && (
                    <EvacuatedHouseholdsTab
                        filteredHouseholds={filteredHouseholds}
                        paginatedHouseholds={paginatedHouseholds}
                        householdsLoading={householdsLoading}
                        selectedHouseholds={selectedHouseholds}
                        setSelectedHouseholds={setSelectedHouseholds}
                        householdPage={householdPage}
                        setHouseholdPage={setHouseholdPage}
                        totalHouseholdPages={totalHouseholdPages}
                        householdNameFilter={householdNameFilter}
                        setHouseholdNameFilter={setHouseholdNameFilter}
                        householdContactFilter={householdContactFilter}
                        setHouseholdContactFilter={setHouseholdContactFilter}
                        householdUnitFilter={householdUnitFilter}
                        setHouseholdUnitFilter={setHouseholdUnitFilter}
                        canManage={canManage}
                        canAdmit={canAdmit}
                        onAdmit={() => navigate('/household-verification')}
                        viewingHousehold={activeViewingHousehold}
                        setViewingHousehold={(r) => {
                            setViewingUnit(null);
                            setViewingHousehold(r);
                        }}
                        setDeleteRecordModal={setDeleteRecordModal}
                        formatDateTime={formatDateTime}
                    />
                )}
            </div>

            {/* ─── Inline Side Panels & Modals ─── */}
            <EvacuationModals
                id={id}
                navigate={navigate}
                center={center}
                units={units}
                evacuatedHouseholds={evacuatedHouseholds}
                expandedUnit={expandedUnit}
                allocations={allocations}
                fetchUnits={fetchUnits}
                fetchEvacuatedHouseholds={fetchEvacuatedHouseholds}
                fetchAllocations={fetchAllocations}
                canManage={canManage}
                canEditUnits={canEditUnits}
                viewingUnit={activeViewingUnit}
                setViewingUnit={setViewingUnit}
                viewingHousehold={activeViewingHousehold}
                setViewingHousehold={setViewingHousehold}
                unitModal={unitModal}
                setUnitModal={setUnitModal}
                editingUnit={editingUnit}
                setEditingUnit={setEditingUnit}
                assignModal={assignModal}
                setAssignModal={setAssignModal}
                assignUnitModal={assignUnitModal}
                setAssignUnitModal={setAssignUnitModal}
                isAssigningUnit={isAssigningUnit}
                confirmAssignUnit={confirmAssignUnit}
                deleteUnitModal={deleteUnitModal}
                setDeleteUnitModal={setDeleteUnitModal}
                isDeletingUnit={isDeletingUnit}
                confirmDeleteUnit={confirmDeleteUnit}
                unassignModal={unassignModal}
                setUnassignModal={setUnassignModal}
                isUnassigning={isUnassigning}
                confirmUnassign={confirmUnassign}
                deleteRecordModal={deleteRecordModal}
                setDeleteRecordModal={setDeleteRecordModal}
                isDeletingRecord={isDeletingRecord}
                confirmDeleteEvacuationRecord={confirmDeleteEvacuationRecord}
            />
        </div>
    );
}
