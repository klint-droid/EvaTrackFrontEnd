import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRecordsByCenter } from '../../api/evacuationRecords/getRecordsByCenter';
import { deleteRecord } from '../../api/evacuationRecords/deleteRecord';
import { assignHousehold } from '../../api/allocations/assignHousehold';
import { unassignHousehold } from '../../api/allocations/unassignHousehold';
import { useAlert } from '../../context/AlertContext';
import { clearDashboardCache } from '../../pages/Dashboard';
import { clearHouseholdsCache } from '../../pages/HouseholdManagement';
import { clearAnalyticsCache } from '../../pages/Analytics';

export interface UseCenterHouseholdsOptions {
  centerId?: string;
  selectedEventId?: string;
  onMutationSuccess?: (action: 'assign' | 'unassign' | 'deleteRecord', data?: any) => void;
}

export function useCenterHouseholds({
  centerId,
  selectedEventId = 'all',
  onMutationSuccess,
}: UseCenterHouseholdsOptions) {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  // Pagination & Filtering
  const [householdPage, setHouseholdPage] = useState<number>(1);
  const [householdNameFilter, setHouseholdNameFilter] = useState<string>('');
  const [householdContactFilter, setHouseholdContactFilter] = useState<string>('');
  const [householdUnitFilter, setHouseholdUnitFilter] = useState<string>('');
  const [householdMethodFilter, setHouseholdMethodFilter] = useState<string>('');

  // Selection & Modals
  const [selectedHouseholds, setSelectedHouseholds] = useState<any[]>([]);
  const [viewingHousehold, setViewingHousehold] = useState<any>(null);
  const [assignUnitModal, setAssignUnitModal] = useState<any>(null);
  const [isAssigningUnit, setIsAssigningUnit] = useState<boolean>(false);
  const [unassignModal, setUnassignModal] = useState<any>(null);
  const [isUnassigning, setIsUnassigning] = useState<boolean>(false);
  const [deleteRecordModal, setDeleteRecordModal] = useState<any>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState<boolean>(false);

  // Evacuated Households Query
  const {
    data: householdsResponse = { data: [] } as any,
    isLoading: householdsLoading,
  } = useQuery<any>({
    queryKey: ['centerHouseholds', centerId, selectedEventId],
    queryFn: async () => {
      if (!centerId) return { data: [] };
      const eventParam = selectedEventId === 'all' || !selectedEventId ? null : selectedEventId;
      return await getRecordsByCenter(centerId, null, eventParam);
    },
    enabled: !!centerId,
  });

  const evacuatedHouseholds: any[] = householdsResponse?.data || [];

  const fetchEvacuatedHouseholds = () => {
    return queryClient.invalidateQueries({ queryKey: ['centerHouseholds', centerId] });
  };

  const confirmAssignUnit = async () => {
    if (!assignUnitModal) return;
    setIsAssigningUnit(true);
    try {
      await assignHousehold(assignUnitModal.unitId, assignUnitModal.evacuationId);
      clearDashboardCache();
      clearHouseholdsCache();
      clearAnalyticsCache();
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      queryClient.invalidateQueries({ queryKey: ['centerUnits', centerId] });
      queryClient.invalidateQueries({ queryKey: ['centerHouseholds', centerId] });
      queryClient.invalidateQueries({ queryKey: ['center', centerId] });
      if (onMutationSuccess) {
        onMutationSuccess('assign', assignUnitModal);
      }
      setAssignUnitModal(null);
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Failed to assign accommodation unit.', 'Error', 'danger');
    } finally {
      setIsAssigningUnit(false);
    }
  };

  const confirmUnassign = async () => {
    if (!unassignModal) return;
    setIsUnassigning(true);
    try {
      await unassignHousehold(unassignModal.unitId, unassignModal.allocationId);
      clearDashboardCache();
      clearHouseholdsCache();
      clearAnalyticsCache();
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      queryClient.invalidateQueries({ queryKey: ['centerUnits', centerId] });
      queryClient.invalidateQueries({ queryKey: ['centerHouseholds', centerId] });
      queryClient.invalidateQueries({ queryKey: ['center', centerId] });
      if (onMutationSuccess) {
        onMutationSuccess('unassign', unassignModal);
      }
      setUnassignModal(null);
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Failed to unassign.', 'Error', 'danger');
    } finally {
      setIsUnassigning(false);
    }
  };

  const confirmDeleteEvacuationRecord = async () => {
    if (!deleteRecordModal) return;
    setIsDeletingRecord(true);
    try {
      await deleteRecord(deleteRecordModal);
      clearDashboardCache();
      clearHouseholdsCache();
      clearAnalyticsCache();
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      queryClient.invalidateQueries({ queryKey: ['center', centerId] });
      queryClient.invalidateQueries({ queryKey: ['centerUnits', centerId] });
      queryClient.invalidateQueries({ queryKey: ['centerHouseholds', centerId] });
      if (onMutationSuccess) {
        onMutationSuccess('deleteRecord', deleteRecordModal);
      }
      setDeleteRecordModal(null);
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Failed to delete evacuation record.', 'Error', 'danger');
    } finally {
      setIsDeletingRecord(false);
    }
  };

  // Filter Computations
  const filteredHouseholds = evacuatedHouseholds.filter((record) => {
    const isCheckedOut =
      record.household_status_id === 6 ||
      record.household_status_id === '6' ||
      Number(record.evacuated_count || 0) === 0;
    if (isCheckedOut) {
      return false;
    }

    const nameStr = `${record.household?.household_name || ''} ID-${record.household_id || ''}`.toLowerCase();
    if (householdNameFilter && !nameStr.includes(householdNameFilter.toLowerCase())) {
      return false;
    }
    const contactStr = record.household?.contact_number || '';
    if (householdContactFilter && !contactStr.includes(householdContactFilter)) {
      return false;
    }
    const unitName =
      record.unit_allocation?.unit?.name ||
      record.unit_allocations?.[0]?.unit?.name ||
      record.unit?.name;
    if (householdUnitFilter === 'assigned' && !unitName) return false;
    if (householdUnitFilter === 'unassigned' && unitName) return false;
    if (
      householdUnitFilter &&
      householdUnitFilter !== 'assigned' &&
      householdUnitFilter !== 'unassigned'
    ) {
      if (!unitName || !unitName.toLowerCase().includes(householdUnitFilter.toLowerCase())) return false;
    }
    const methodStr = (record.method || 'manual').toLowerCase();
    if (householdMethodFilter && methodStr !== householdMethodFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  const totalHouseholdPages = Math.ceil(filteredHouseholds.length / 15) || 1;
  const paginatedHouseholds = filteredHouseholds.slice(
    (householdPage - 1) * 15,
    householdPage * 15
  );

  return {
    evacuatedHouseholds,
    filteredHouseholds,
    paginatedHouseholds,
    totalHouseholdPages,
    householdsLoading,
    householdPage,
    setHouseholdPage,
    householdNameFilter,
    setHouseholdNameFilter,
    householdContactFilter,
    setHouseholdContactFilter,
    householdUnitFilter,
    setHouseholdUnitFilter,
    householdMethodFilter,
    setHouseholdMethodFilter,
    selectedHouseholds,
    setSelectedHouseholds,
    viewingHousehold,
    setViewingHousehold,
    assignUnitModal,
    setAssignUnitModal,
    isAssigningUnit,
    confirmAssignUnit,
    unassignModal,
    setUnassignModal,
    isUnassigning,
    deleteRecordModal,
    setDeleteRecordModal,
    isDeletingRecord,
    confirmUnassign,
    confirmDeleteEvacuationRecord,
    fetchEvacuatedHouseholds,
  };
}

