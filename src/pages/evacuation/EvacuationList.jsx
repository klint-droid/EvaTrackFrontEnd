import { useEffect, useState } from "react";
import {
  Home, MapPin, Users, Plus, Search,
  ChevronRight, DoorOpen, AlertCircle, UserCheck, ShieldAlert, Eye,
  LayoutGrid, TableProperties, Map as MapIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { getCenters }    from "../../api/evacuation/getCenters";
import { deleteCenter }  from "../../api/evacuation/deleteCenter";
import { createCenter }  from "../../api/evacuation/createCenter";
import { updateCenter }  from "../../api/evacuation/updateCenter";
import { isAdmin, isSuperAdmin, isPersonnel, getAssignedCenterId } from "../../utils/roles";

import CenterModal  from "../../components/evacuation/CenterModal";
import AssignPersonnelModal from "../../components/evacuation/AssignPersonnelModal";
import AlertConfirmModal from "../../components/AlertConfirmModal";
import { useAlert } from "../../context/AlertContext";

import { TableLayout } from "../../components/ui/TableLayout";
import { Table, TableHeader, TableRow, TableHead, TableCell, StatusBadge, RowMenu } from "../../ui/Table";
import { StatCard } from "../../components/ui/StatCard";
import AnimatedFAB from "../../components/ui/AnimatedFAB";
import EvacuationCenterCard from "../../components/evacuation/EvacuationCenterCard";
import EvacuationCenterMap from "../../components/evacuation/EvacuationCenterMap";

export default function EvacuationList() {
  const navigate = useNavigate();
  const [centers, setCenters]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [viewMode, setViewMode]               = useState("split"); // 'split' | 'table'
  const [focusedCenterId, setFocusedCenterId] = useState(null);
  const [mobileTab, setMobileTab]             = useState("list"); // 'list' | 'map'
  const [modalOpen, setModalOpen]             = useState(false);
  const [assigningCenter, setAssigningCenter] = useState(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState({ isOpen: false, centerId: null, isLoading: false });
  const [saveConfirmState, setSaveConfirmState]     = useState({ isOpen: false, formData: null, isLoading: false });
  const [selected, setSelected]               = useState(null);
  const [colFilters, setColFilters]           = useState({ name: '' });
  const { showAlert } = useAlert();

  const canCreate = isAdmin() || isSuperAdmin();
  const canEdit   = isAdmin() || isSuperAdmin();
  const canDelete = isAdmin() || isSuperAdmin();

  useEffect(() => { fetchCenters(); }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      setCenters(await getCenters());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSubmit = (form) => {
    setSaveConfirmState({ isOpen: true, formData: form, isLoading: false });
  };

  const handleConfirmSubmit = async () => {
    const { formData } = saveConfirmState;
    if (!formData) return;

    setSaveConfirmState(prev => ({ ...prev, isLoading: true }));
    try {
      if (selected) {
        await updateCenter(selected.evacuation_center_id, formData);
        showAlert("Evacuation Center updated successfully!", "Success", "success");
      } else {
        await createCenter(formData);
        showAlert("Evacuation Center created successfully!", "Success", "success");
      }
      setModalOpen(false);
      setSelected(null);
      setSaveConfirmState({ isOpen: false, formData: null, isLoading: false });
      fetchCenters();
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to save evacuation center.", "Error", "danger");
      setSaveConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDelete = async (id) => {
    const targetId = typeof id === "string" || typeof id === "number" ? id : deleteConfirmState.centerId;
    if (!targetId) return;

    setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
    try {
      await deleteCenter(targetId);
      showAlert("Evacuation Center deleted successfully!", "Success", "success");
      setDeleteConfirmState({ isOpen: false, centerId: null, isLoading: false });
      fetchCenters();
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to delete evacuation center.", "Error", "danger");
      setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const assignedCenterId = getAssignedCenterId();

  // Derived Statistics
  const totalOccupants = centers.reduce((sum, c) => sum + (Number(c.current_occupancy) || 0), 0);
  const totalCapacity = centers.reduce((sum, c) => sum + (Number(c.capacity) || 0), 0);
  const totalHouseholds = centers.reduce((sum, c) => sum + (Number(c.household_count) || 0), 0);

  const statsComponent = (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard title="Total Centers" value={centers.length} dotColor="#3b82f6" />
      <StatCard title="Current Occupants" value={totalOccupants} dotColor="#10b981" />
      <StatCard title="Total Capacity" value={totalCapacity} dotColor="#6366f1" />
      <StatCard title="Evacuated Families" value={totalHouseholds} dotColor="#f59e0b" />
    </div>
  );

  const queryTerm = (search || colFilters.name).toLowerCase();
  const filteredCenters = centers.filter((c) => {
    const addrStr = (c.osm_address || "").toLowerCase();
    return `${c.name} ${addrStr}`.toLowerCase().includes(queryTerm);
  });

  // View Switcher (Split vs Full Table)
  const viewSwitcher = (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setViewMode("split")}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
          viewMode === "split"
            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
      >
        <LayoutGrid size={13} />
        <span className="hidden sm:inline">Map & List</span>
      </button>
      <button
        type="button"
        onClick={() => setViewMode("table")}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
          viewMode === "table"
            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
      >
        <TableProperties size={13} />
        <span className="hidden sm:inline">Full Table</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-4 font-sans text-left">
      <TableLayout
        title="Evacuation Centers"
        badgeText={`${centers.length} Shelters`}
        subtitle="Real-time shelter capacity, occupancy monitoring, and evacuation unit management"
        actions={viewSwitcher}
        onExport={() => {
          const csvHeader = "Center ID,Name,Address,Occupancy,Capacity,Households\n";
          const csvRows = filteredCenters
            .map((c) => `${c.evacuation_center_id},"${c.name || ''}","${c.osm_address || ''}",${c.current_occupancy || 0},${c.capacity || 0},${c.household_count || 0}`)
            .join("\n");
          const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "evacuation_centers_report.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        onAdd={canCreate ? () => { setSelected(null); setModalOpen(true); } : undefined}
        addLabel="Add Center"
        stats={statsComponent}
      >
        {viewMode === "split" ? (
          /* ─── TWO-COLUMN SPLIT VIEW (LIST + INTERACTIVE MAP) ─── */
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
            {/* Mobile Tab Switcher (< lg screens) */}
            <div className="lg:hidden col-span-1 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex">
              <button
                type="button"
                onClick={() => setMobileTab("list")}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  mobileTab === "list"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-transparent text-slate-500 dark:text-slate-400"
                }`}
              >
                <LayoutGrid size={13} />
                <span>Shelters ({filteredCenters.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("map")}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  mobileTab === "map"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-transparent text-slate-500 dark:text-slate-400"
                }`}
              >
                <MapIcon size={13} />
                <span>Interactive Map</span>
              </button>
            </div>

            {/* LEFT COLUMN: Scrollable Cards (approx 42% / 5 cols) */}
            <div
              className={`lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 ${
                mobileTab === "map" ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Search Bar on Card Panel */}
              <div className="p-3 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter shelters by name or street..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Cards Container with smooth scrolling */}
              <div className="flex-1 overflow-y-auto max-h-[640px] p-3 space-y-3 custom-scrollbar">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 animate-pulse space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-1 flex-1">
                          <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="w-48 h-2.5 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                  ))
                ) : filteredCenters.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <AlertCircle size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No shelters match your search.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting the search query above.
                    </p>
                  </div>
                ) : (
                  filteredCenters.map((center) => {
                    const isAssigned =
                      assignedCenterId &&
                      String(center.evacuation_center_id) === String(assignedCenterId);
                    const isFocused =
                      String(center.evacuation_center_id) === String(focusedCenterId);

                    return (
                      <EvacuationCenterCard
                        key={center.evacuation_center_id}
                        center={center}
                        isAssigned={isAssigned}
                        isFocused={isFocused}
                        onFocus={(id) => setFocusedCenterId(id)}
                        onNavigate={(id) => navigate(`/evacuation-centers/${id}`)}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onEdit={(c) => {
                          setSelected(c);
                          setModalOpen(true);
                        }}
                        onDelete={(c) => {
                          setSelected(c);
                          setDeleteConfirmState({
                            isOpen: true,
                            centerId: c.evacuation_center_id,
                            isLoading: false,
                          });
                        }}
                        onAssignPersonnel={(c) => setAssigningCenter(c)}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Interactive Leaflet Map (approx 58% / 7 cols) */}
            <div
              className={`lg:col-span-7 h-[540px] lg:h-auto min-h-[540px] p-3 bg-slate-50/20 dark:bg-slate-950/30 ${
                mobileTab === "list" ? "hidden lg:block" : "block"
              }`}
            >
              <EvacuationCenterMap
                centers={filteredCenters}
                focusedCenterId={focusedCenterId}
                assignedCenterId={assignedCenterId}
                onSelectCenter={(id) => {
                  setFocusedCenterId(id);
                }}
                className="h-full min-h-[520px]"
              />
            </div>
          </div>
        ) : (
          /* ─── FULL TABLE VIEW ─── */
          <Table>
            <TableHeader>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <TableHead
                  filterable
                  filterValue={colFilters.name}
                  onFilterChange={(v) => setColFilters((prev) => ({ ...prev, name: v }))}
                >
                  Evacuation Center
                </TableHead>
                <TableHead className="text-center">Occupancy Rate</TableHead>
                <TableHead className="text-center">Evacuees</TableHead>
                <TableHead className="text-center">Households</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </tr>
            </TableHeader>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0" />
                        <div className="space-y-1">
                          <div className="w-36 h-3 bg-slate-200 rounded" />
                          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="w-28 h-2.5 bg-slate-100 dark:bg-slate-800 rounded mx-auto" /></TableCell>
                    <TableCell className="text-center"><div className="w-12 h-3 bg-slate-100 dark:bg-slate-800 rounded mx-auto" /></TableCell>
                    <TableCell className="text-center"><div className="w-8 h-3 bg-slate-100 dark:bg-slate-800 rounded mx-auto" /></TableCell>
                    <TableCell className="text-right"><div className="w-12 h-4 bg-slate-100 dark:bg-slate-800 rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCenters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="5" className="py-14 text-center text-slate-400 text-xs font-medium">
                    No evacuation centers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCenters.map((c) => {
                  const current    = Number(c.current_occupancy) || 0;
                  const max        = Number(c.capacity) || 0;
                  const percent    = max ? Math.min(100, (current / max) * 100) : 0;
                  const isAssigned = assignedCenterId && String(c.evacuation_center_id) === String(assignedCenterId);

                  return (
                    <TableRow
                      key={c.evacuation_center_id}
                      onClick={() => navigate(`/evacuation-centers/${c.evacuation_center_id}`)}
                      className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0 transition-colors ${
                            isAssigned
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                          }`}>
                            <Home size={14} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {c.name}
                              </p>
                              {isAssigned && (
                                <span className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded bg-blue-50 border border-blue-200 text-blue-700">
                                  My Station
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate max-w-[280px] leading-tight">
                              {c.osm_address || "No location address recorded"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center min-w-[140px]">
                        <div className="space-y-1 max-w-[120px] mx-auto">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            <span>{Math.round(percent)}%</span>
                            <span>{current}/{max}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users size={13} className="text-blue-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {current}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <DoorOpen size={13} className="text-indigo-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {c.household_count ?? 0}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <RowMenu
                          onView={() => navigate(`/evacuation-centers/${c.evacuation_center_id}`)}
                          actions={[
                            ...(canEdit ? [{ label: "Assign Personnel", onClick: () => setAssigningCenter(c) }] : [])
                          ]}
                          onEdit={canEdit ? () => { setSelected(c); setModalOpen(true); } : undefined}
                          onDelete={canDelete ? () => { setSelected(c); setDeleteConfirmState({ isOpen: true, centerId: c.evacuation_center_id, isLoading: false }); } : undefined}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </tbody>
          </Table>
        )}
      </TableLayout>

      {assigningCenter && (
        <AssignPersonnelModal
          center={assigningCenter}
          onClose={() => setAssigningCenter(null)}
          onSaved={fetchCenters}
        />
      )}

      <CenterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={triggerSubmit}
        initialData={selected}
      />
      <AlertConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title="Delete Evacuation Center"
        message="Are you sure you want to delete this evacuation center? This action is permanent and will remove all associated records."
        confirmText="Delete Center"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteConfirmState.isLoading}
        onConfirm={() => handleDelete(deleteConfirmState.centerId)}
        onClose={() => setDeleteConfirmState({ isOpen: false, centerId: null, isLoading: false })}
      />
      <AlertConfirmModal
        isOpen={saveConfirmState.isOpen}
        title={selected ? "Apply Changes" : "Register Station"}
        message={selected ? `Are you sure you want to apply these changes to ${selected.name}?` : `Are you sure you want to register ${saveConfirmState.formData?.name}?`}
        confirmText={selected ? "Apply Changes" : "Register"}
        cancelText="Cancel"
        type={selected ? "info" : "success"}
        isLoading={saveConfirmState.isLoading}
        onConfirm={handleConfirmSubmit}
        onClose={() => setSaveConfirmState({ isOpen: false, formData: null, isLoading: false })}
      />

      {canCreate && (
        <AnimatedFAB
          icon={Plus}
          label="Add Center"
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
