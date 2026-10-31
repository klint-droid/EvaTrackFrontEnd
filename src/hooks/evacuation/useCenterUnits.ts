import { useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getUnitsByCenter } from '../../api/units/getUnitsByCenter';
import { deleteUnit } from '../../api/units/deleteUnit';
import { getUnitAllocations } from '../../api/allocations/getUnitAllocations';
import { can } from '../../utils/roles';
import { useAlert } from '../../context/AlertContext';

export interface UseCenterUnitsOptions {
  centerId?: string;
  pageSize?: number;
}

export function useCenterUnits({ centerId, pageSize = 15 }: UseCenterUnitsOptions) {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  // Pagination & Filtering
  const [unitsPage, setUnitsPage] = useState<number>(1);
  const [unitNameFilter, setUnitNameFilter] = useState<string>('');
  const [unitTypeFilter, setUnitTypeFilter] = useState<string>('');
  const [unitStatusFilter, setUnitStatusFilter] = useState<string>('');

  // Selection & Expansion
  const [selectedUnits, setSelectedUnits] = useState<any[]>([]);
  const [expandedUnit, setExpandedUnit] = useState<string | number | null>(null);
  const [allocations, setAllocations] = useState<Record<string | number, any[]>>({});

  // Modals
  const [viewingUnit, setViewingUnit] = useState<any>(null);
  const [unitModal, setUnitModal] = useState<boolean>(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [assignModal, setAssignModal] = useState<any>(null);
  const [deleteUnitModal, setDeleteUnitModal] = useState<any>(null);
  const [isDeletingUnit, setIsDeletingUnit] = useState<boolean>(false);

  // Permissions (Open-Closed Capability Matrix)
  const canEditUnits = can('units:manage');

  // Query Units
  const { data: unitsResponse = { data: [] } as any, isLoading: isUnitsLoading } = useQuery<any>({
    queryKey: ['centerUnits', centerId, unitsPage],
    queryFn: async () => {
      if (!centerId) return { data: [] };
      return await getUnitsByCenter(centerId, unitsPage, pageSize);
    },
    enabled: !!centerId,
    placeholderData: keepPreviousData,
  });

  const units: any[] = unitsResponse?.data || [];
  const unitsMeta = {
    current_page: unitsResponse?.current_page,
    last_page: unitsResponse?.last_page,
    total: unitsResponse?.total,
    from: unitsResponse?.from,
    to: unitsResponse?.to,
  };

  const fetchUnits = (page = unitsPage) => {
    setUnitsPage(page);
    return queryClient.invalidateQueries({ queryKey: ['centerUnits', centerId] });
  };

  const fetchAllocations = async (unitId: string | number) => {
    try {
      const res = await getUnitAllocations(unitId);
      setAllocations(prev => ({ ...prev, [unitId]: res.data || [] }));
    } catch (err) {
      console.error("Failed to fetch unit allocations", err);
    }
  };

  const toggleUnit = async (unitId: string | number) => {
    if (expandedUnit === unitId) {
      setExpandedUnit(null);
    } else {
      setExpandedUnit(unitId);
      await fetchAllocations(unitId);
    }
  };

  const confirmDeleteUnit = async () => {
    if (!deleteUnitModal || !centerId) return;
    setIsDeletingUnit(true);
    try {
      await deleteUnit(centerId, deleteUnitModal.unit_id);
      setDeleteUnitModal(null);
      queryClient.invalidateQueries({ queryKey: ['centerUnits', centerId] });
      queryClient.invalidateQueries({ queryKey: ['center', centerId] });
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'Failed to delete unit.', 'Error', 'danger');
    } finally {
      setIsDeletingUnit(false);
    }
  };

  // Filter Computations
  const filteredUnits = units.filter(unit => {
    if (unitNameFilter && !`${unit.name} ID-${unit.unit_id}`.toLowerCase().includes(unitNameFilter.toLowerCase())) {
      return false;
    }
    const typeLabel = unit.type?.type_label || 'Standard Unit';
    if (unitTypeFilter && !typeLabel.toLowerCase().includes(unitTypeFilter.toLowerCase())) {
      return false;
    }
    const occupancy = Number(unit.current_occupancy ?? 0);
    const capacity = Number(unit.max_capacity ?? 0);
    const percent = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;
    const isFull = capacity > 0 && occupancy >= capacity;
    const isHigh = percent >= 80 && percent < 100;
    const isAvailable = percent < 80;

    if (unitStatusFilter === "available" && !isAvailable) return false;
    if (unitStatusFilter === "high" && !isHigh) return false;
    if (unitStatusFilter === "full" && !isFull) return false;

    return true;
  });

  return {
    units,
    unitsMeta,
    filteredUnits,
    isUnitsLoading,
    unitsPage,
    setUnitsPage,
    unitNameFilter,
    setUnitNameFilter,
    unitTypeFilter,
    setUnitTypeFilter,
    unitStatusFilter,
    setUnitStatusFilter,
    selectedUnits,
    setSelectedUnits,
    expandedUnit,
    setExpandedUnit,
    allocations,
    setAllocations,
    fetchUnits,
    fetchAllocations,
    toggleUnit,
    canEditUnits,

    // Modals
    viewingUnit,
    setViewingUnit,
    unitModal,
    setUnitModal,
    editingUnit,
    setEditingUnit,
    assignModal,
    setAssignModal,
    deleteUnitModal,
    setDeleteUnitModal,
    isDeletingUnit,
    confirmDeleteUnit,
  };
}
