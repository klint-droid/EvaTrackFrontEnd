import { useEffect, useState } from 'react';
import { getEvents } from '../api/events/getEvents';
import { getHistoryEvents } from '../api/events/getHistoryEvents';
import { getDisasterTypes } from '../api/events/getDisasterTypes';

export const useEventManagement = () => {
  const [events, setEvents] = useState([]);
  const [historicalEvents, setHistoricalEvents] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [filters, setFilters] = useState({
    type_id: '',
    start_date: '',
    end_date: ''
  });

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [assigningEvent, setAssigningEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);

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

  const fetchHistory = async (page = 1) => {
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

  const uniqueRegions = new Set();
  activeEvents.forEach(e => {
    (e.evacuation_centers || []).forEach(c => {
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
