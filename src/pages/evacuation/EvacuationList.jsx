import { useEffect, useState } from "react";
import {
  Home, MapPin, Users, Plus, Search,
  ChevronRight, DoorOpen, AlertCircle, UserCheck, ShieldAlert, Eye
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

export default function EvacuationList() {
  const navigate = useNavigate();
  const [centers, setCenters]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [assigningCenter, setAssigningCenter] = useState(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState({ isOpen: false, centerId: null, isLoading: false });
  const [saveConfirmState, setSaveConfirmState] = useState({ isOpen: false, formData: null, isLoading: false });
  const [selected, setSelected]       = useState(null);
  const [colFilters, setColFilters]   = useState({ name: '' });
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
    setDeleteConfirmState(prev => ({ ...prev, isLoading: true }));
    try {
      await deleteCenter(id);
      showAlert("Evacuation Center deleted successfully!", "Success", "success");
      setDeleteConfirmState({ isOpen: false, centerId: null, isLoading: false });
      fetchCenters();
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to delete evacuation center.", "Error", "danger");
      setDeleteConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const assignedCenterId = getAssignedCenterId();
  const personnelWithCenter = isPersonnel() && assignedCenterId;

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

  const filteredCenters = centers.filter((c) => {
    const addrStr = (c.osm_address || "").toLowerCase();
    return `${c.name} ${addrStr}`.toLowerCase().includes((colFilters.name || search).toLowerCase());
  });

  return (
    <div className="space-y-4 font-sans text-left">
      <TableLayout
        title="Evacuation Centers"
        badgeText={`${centers.length} Shelters`}
        subtitle="Real-time shelter capacity, occupancy monitoring, and evacuation unit management"
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
        onConfirm={handleDelete}
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
