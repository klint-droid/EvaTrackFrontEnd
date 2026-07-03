import { useEffect, useState } from 'react';
import { getEvents } from '../api/events/getEvents';
import { getHistoryEvents } from '../api/events/getHistoryEvents';
import { getDisasterTypes } from '../api/events/getDisasterTypes';

interface Filters {
  type_id: string;
  start_date: string;
  end_date: string;
}

export const useEventManagement = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<any[]>([]);
  const [historyPagination, setHistoryPagination] = useState<any>({});
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  
  const [disasterTypes, setDisasterTypes] = useState<any[]>([]);
  const [filters, setFilters] = useState<Filters>({
    type_id: '',
    start_date: '',
    end_date: ''
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [assigningEvent, setAssigningEvent] = useState<any>(null);
  const [viewingEvent, setViewingEvent] = useState<any>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (page: number = 1) => {
    setHistoryLoading(true);
    try {
      const res = await getHistoryEvents(page, filters);
      setHistoricalEvents(res.data || []);
      setHistoryPagination(res);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { 
    fetchEvents(); 
    fetchHistory(1);
    getDisasterTypes().then(res => setDisasterTypes(Array.isArray(res) ? res : (res?.data || [])));
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [filters.type_id, filters.start_date, filters.end_date]);

  const activeEvents = events.filter(e => !e.ended_at);

  const activeCount = activeEvents.length;
  const totalAssignedCenters = activeEvents.reduce((acc, curr) => {
    return acc + (curr.evacuation_centers?.length || 0);
  }, 0);

  const uniqueRegions = new Set<string>();
  activeEvents.forEach(e => {
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
    filters, setFilters,
    loading,
    showModal, setShowModal,
    showFilters, setShowFilters,
    assigningEvent, setAssigningEvent,
    viewingEvent, setViewingEvent,
    activeEvents,
    activeCount,
    totalAssignedCenters,
    uniqueRegions,
    fetchEvents,
    fetchHistory
  };
};
