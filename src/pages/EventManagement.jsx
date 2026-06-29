import { useEffect, useState } from 'react';
import { getEvents } from '../api/events/getEvents';
import EventModal from '../components/events/EventModal';
import AssignCentersModal from '../components/events/AssignCentersModal';
import EventDetailsModal from '../components/events/EventDetailsModal';
import { getHistoryEvents } from '../api/events/getHistoryEvents';
import { getDisasterTypes } from '../api/events/getDisasterTypes';

import EventHeader from '../components/events/EventHeader';
import EventStatsCards from '../components/events/EventStatsCards';
import ActiveEventsList from '../components/events/ActiveEventsList';
import HistoricalEventsLog from '../components/events/HistoricalEventsLog';

export default function EventManagement() {
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

  return (
    <div className="min-h-screen font-sans text-left">
      <EventHeader setShowModal={setShowModal} />

      <EventStatsCards 
        activeCount={activeCount}
        totalAssignedCenters={totalAssignedCenters}
        uniqueRegions={uniqueRegions}
        historyTotal={historyPagination.total}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200/80">
          <div className="w-7 h-7 border-[2.5px] border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm mt-3 font-medium">Loading events...</p>
        </div>
      ) : (
        <>
          <ActiveEventsList 
            activeEvents={activeEvents}
            setAssigningEvent={setAssigningEvent}
            fetchEvents={fetchEvents}
          />

          <HistoricalEventsLog 
            historyPagination={historyPagination}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filters={filters}
            setFilters={setFilters}
            disasterTypes={disasterTypes}
            historyLoading={historyLoading}
            historicalEvents={historicalEvents}
            fetchHistory={fetchHistory}
            setViewingEvent={setViewingEvent}
          />
        </>
      )}

      {showModal && (
        <EventModal
          onClose={() => setShowModal(false)}
          onCreated={fetchEvents}
        />
      )}

      {assigningEvent && (
        <AssignCentersModal
          event={assigningEvent}
          onClose={() => setAssigningEvent(null)}
          onSaved={fetchEvents}
        />
      )}

      {viewingEvent && (
        <EventDetailsModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
        />
      )}
    </div>
  );
}