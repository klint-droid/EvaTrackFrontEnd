import EventModal from '../components/events/EventModal';
import AssignCentersModal from '../components/events/AssignCentersModal';
import EventDetailsModal from '../components/events/EventDetailsModal';
import EventHeader from '../components/events/EventHeader';
import EventStatsCards from '../components/events/EventStatsCards';
import ActiveEventsList from '../components/events/ActiveEventsList';
import HistoricalEventsLog from '../components/events/HistoricalEventsLog';
import { useEventManagement } from '../hooks/useEventManagement';

export default function EventManagement() {
  const {
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
  } = useEventManagement();

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