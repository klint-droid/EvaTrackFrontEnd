import { useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getEvents } from '../api/events/getEvents';
import { getHistoryEvents, type HistoryEventFilters } from '../api/events/getHistoryEvents';
import { getDisasterTypes } from '../api/events/getDisasterTypes';

export interface Filters extends HistoryEventFilters {
  type_id: string;
  start_date: string;
  end_date: string;
  q?: string;
}

export const useEventManagement = () => {
  const queryClient = useQueryClient();

  const [historyPage, setHistoryPage] = useState<number>(1);
  const [filters, setFiltersState] = useState<Filters>({
    type_id: '',
    start_date: '',
    end_date: '',
    q: ''
  });

  const setFilters = (newFilters: Filters | ((prev: Filters) => Filters)) => {
    setHistoryPage(1);
    setFiltersState(newFilters);
  };

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [assigningEvent, setAssigningEvent] = useState<any>(null);
  const [viewingEvent, setViewingEvent] = useState<any>(null);

  // 1. Events Query
  const { 
    data: events = [], 
    isLoading: loading 
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await getEvents();
      return res.data || [];
    }
  });

  // 2. Disaster Types Query (Lookup data, cached for entire session)
  const { 
    data: disasterTypes = [] 
  } = useQuery({
    queryKey: ['disasterTypes'],
    queryFn: async () => {
      const res = await getDisasterTypes();
      return Array.isArray(res) ? res : (res?.data || []);
    },
    staleTime: Infinity,
  });

  // 3. Historical Events Query (Paginated & Filtered)
  const { 
    data: historyPagination = { data: [] } as any, 
    isFetching: historyLoading 
  } = useQuery({
    queryKey: ['events', 'history', historyPage, filters],
    queryFn: async () => {
      return await getHistoryEvents(historyPage, filters);
    },
    placeholderData: keepPreviousData,
  });

  const historicalEvents = (historyPagination as any)?.data || [];

  const fetchEvents = () => {
    return queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const fetchHistory = (page?: number) => {
    if (typeof page === 'number') {
      setHistoryPage(page);
    } else {
      queryClient.invalidateQueries({ queryKey: ['events', 'history'] });
    }
  };

  const activeEvents = events.filter((e: any) => !e.ended_at);

  const activeCount = activeEvents.length;
  const totalAssignedCenters = activeEvents.reduce((acc: number, curr: any) => {
    return acc + (curr.evacuation_centers?.length || 0);
  }, 0);

  const uniqueRegions = new Set<string>();
  activeEvents.forEach((e: any) => {
    (e.evacuation_centers || []).forEach((c: any) => {
      if (c.region) uniqueRegions.add(c.region);
    });
  });

  return {
    events,
    historicalEvents,
    historyPagination,
    historyLoading,
    disasterTypes,
    filters,
    setFilters,
    loading,
    showModal,
    setShowModal,
    showFilters,
    setShowFilters,
    assigningEvent,
    setAssigningEvent,
    viewingEvent,
    setViewingEvent,
    activeEvents,
    activeCount,
    totalAssignedCenters,
    uniqueRegions,
    fetchEvents,
    fetchHistory
  };
};
