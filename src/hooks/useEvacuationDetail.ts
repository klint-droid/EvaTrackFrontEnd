import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCenter } from '../api/evacuation/getCenter';
import { getEvents } from '../api/events/getEvents';
import { can, isPersonnel } from '../utils/roles';
import { useCenterUnits } from './evacuation/useCenterUnits';
import { useCenterHouseholds } from './evacuation/useCenterHouseholds';

/**
 * Composite Hook: useEvacuationDetail
 * 
 * Adheres to SOLID Principles:
 * - Single Responsibility (SRP): Coordinates center profile, event synchronization,
 *   and delegates units/households sub-domains to focused micro-hooks.
 * - Interface Segregation (ISP): Sub-hooks (useCenterUnits, useCenterHouseholds) can be
 *   consumed directly by components that don't need the entire page context.
 * - Open-Closed (OCP): Uses the unified capability matrix (`can`) for permissions.
 */
export function useEvacuationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const activeTab = searchParams.get('tab') || 'units';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // 1. Center Query
  const { data: center = null, isLoading: isCenterLoading } = useQuery<any>({
    queryKey: ['center', id],
    queryFn: async () => {
      if (!id) return null;
      return await getCenter(id);
    },
    enabled: !!id,
  });

  // 2. Events Query (Cached)
  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res: any = await getEvents();
      return res.data || res || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Sync selectedEventId from center when center loads
  useEffect(() => {
    if (center && !selectedEventId) {
      setSelectedEventId(center.current_event_id || 'all');
    }
  }, [center]);

  // 3. Delegate to Domain Micro-Hooks (SRP & ISP)
  const unitsDomain = useCenterUnits({ centerId: id, pageSize: 15 });

  const householdsDomain = useCenterHouseholds({
    centerId: id,
    selectedEventId,
    onMutationSuccess: async (action, data) => {
      if ((action === 'unassign' || action === 'assign') && data?.unitId) {
        await unitsDomain.fetchAllocations(data.unitId);
      } else if (action === 'deleteRecord' && unitsDomain.expandedUnit) {
        await unitsDomain.fetchAllocations(unitsDomain.expandedUnit);
      }
    },
  });

  // Permissions via Capability Matrix (OCP)
  const canManage = can('centers:manage') || isPersonnel();
  const canAdmit = can('evacuees:admit');
  const canEditUnits = can('units:manage');

  const loading = isCenterLoading || unitsDomain.isUnitsLoading;

  const fetchCenter = () => {
    return queryClient.invalidateQueries({ queryKey: ['center', id] });
  };

  const fetchEvacuatedHouseholds = (eventIdFilter = selectedEventId) => {
    if (eventIdFilter !== selectedEventId) {
      setSelectedEventId(eventIdFilter);
    }
    return householdsDomain.fetchEvacuatedHouseholds();
  };

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  return {
    id,
    navigate,
    activeTab,
    setActiveTab,
    center,
    events,
    selectedEventId,
    setSelectedEventId,
    loading,
    householdsLoading: householdsDomain.householdsLoading,
    formatDateTime,
    fetchCenter,

    // Permissions
    canManage,
    canAdmit,
    canEditUnits,

    // Units Domain (spread from useCenterUnits)
    units: unitsDomain.units,
    unitsMeta: unitsDomain.unitsMeta,
    filteredUnits: unitsDomain.filteredUnits,
    expandedUnit: unitsDomain.expandedUnit,
    allocations: unitsDomain.allocations,
    unitNameFilter: unitsDomain.unitNameFilter,
    setUnitNameFilter: unitsDomain.setUnitNameFilter,
    unitTypeFilter: unitsDomain.unitTypeFilter,
    setUnitTypeFilter: unitsDomain.setUnitTypeFilter,
    unitStatusFilter: unitsDomain.unitStatusFilter,
    setUnitStatusFilter: unitsDomain.setUnitStatusFilter,
    selectedUnits: unitsDomain.selectedUnits,
    setSelectedUnits: unitsDomain.setSelectedUnits,
    toggleUnit: unitsDomain.toggleUnit,
    fetchUnits: unitsDomain.fetchUnits,
    fetchAllocations: unitsDomain.fetchAllocations,
    unitsPage: unitsDomain.unitsPage,
    setUnitsPage: unitsDomain.setUnitsPage,

    // Unit Modals
    viewingUnit: unitsDomain.viewingUnit,
    setViewingUnit: unitsDomain.setViewingUnit,
    unitModal: unitsDomain.unitModal,
    setUnitModal: unitsDomain.setUnitModal,
    editingUnit: unitsDomain.editingUnit,
    setEditingUnit: unitsDomain.setEditingUnit,
    assignModal: unitsDomain.assignModal,
    setAssignModal: unitsDomain.setAssignModal,
    deleteUnitModal: unitsDomain.deleteUnitModal,
    setDeleteUnitModal: unitsDomain.setDeleteUnitModal,
    isDeletingUnit: unitsDomain.isDeletingUnit,
    confirmDeleteUnit: unitsDomain.confirmDeleteUnit,

    // Households Domain (spread from useCenterHouseholds)
    evacuatedHouseholds: householdsDomain.evacuatedHouseholds,
    filteredHouseholds: householdsDomain.filteredHouseholds,
    paginatedHouseholds: householdsDomain.paginatedHouseholds,
    totalHouseholdPages: householdsDomain.totalHouseholdPages,
    householdPage: householdsDomain.householdPage,
    setHouseholdPage: householdsDomain.setHouseholdPage,
    householdNameFilter: householdsDomain.householdNameFilter,
    setHouseholdNameFilter: householdsDomain.setHouseholdNameFilter,
    householdContactFilter: householdsDomain.householdContactFilter,
    setHouseholdContactFilter: householdsDomain.setHouseholdContactFilter,
    householdUnitFilter: householdsDomain.householdUnitFilter,
    setHouseholdUnitFilter: householdsDomain.setHouseholdUnitFilter,
    householdMethodFilter: householdsDomain.householdMethodFilter,
    setHouseholdMethodFilter: householdsDomain.setHouseholdMethodFilter,
    selectedHouseholds: householdsDomain.selectedHouseholds,
    setSelectedHouseholds: householdsDomain.setSelectedHouseholds,
    fetchEvacuatedHouseholds,

    // Household Modals
    viewingHousehold: householdsDomain.viewingHousehold,
    setViewingHousehold: householdsDomain.setViewingHousehold,
    assignUnitModal: householdsDomain.assignUnitModal,
    setAssignUnitModal: householdsDomain.setAssignUnitModal,
    isAssigningUnit: householdsDomain.isAssigningUnit,
    confirmAssignUnit: householdsDomain.confirmAssignUnit,
    unassignModal: householdsDomain.unassignModal,
    setUnassignModal: householdsDomain.setUnassignModal,
    isUnassigning: householdsDomain.isUnassigning,
    confirmUnassign: householdsDomain.confirmUnassign,
    deleteRecordModal: householdsDomain.deleteRecordModal,
    setDeleteRecordModal: householdsDomain.setDeleteRecordModal,
    isDeletingRecord: householdsDomain.isDeletingRecord,
    confirmDeleteEvacuationRecord: householdsDomain.confirmDeleteEvacuationRecord,
  };
}
