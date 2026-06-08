import { useEffect, useState } from "react";
import {
  Home, MapPin, Users, Plus, Search,
  ChevronRight, DoorOpen, AlertCircle, UserCheck
} from "lucide-react";
import { Link } from "react-router-dom";

import { getCenters }    from "../../api/evacuation/getCenters";
import { deleteCenter }  from "../../api/evacuation/deleteCenter";
import { createCenter }  from "../../api/evacuation/createCenter";
import { updateCenter }  from "../../api/evacuation/updateCenter";
import { isAdmin, isSuperAdmin, isPersonnel, getAssignedCenterId } from "../../utils/roles";

import CenterModal  from "../../components/evacuation/CenterModal";
import { DeleteModal } from "../../components/evacuation/DeleteModal";

const CenterSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 animate-pulse flex flex-col justify-between h-[308px]">
    <div className="space-y-4 flex-1">
      {/* TOP ROW */}
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
        <div className="w-24 h-6 bg-slate-50 rounded-full border border-slate-100/50" />
      </div>

      {/* NAME */}
      <div className="h-6 bg-slate-200 rounded-lg w-2/3" />

      {/* ADDRESS */}
      <div className="space-y-1.5 mt-2">
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>

      {/* OCCUPANCY BAR */}
      <div className="space-y-2 mt-4">
        <div className="flex justify-between">
          <div className="h-3 bg-slate-100 rounded w-1/4" />
          <div className="h-3 bg-slate-100 rounded w-1/12" />
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden" />
      </div>

      {/* STAT TILES */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2">
          <div className="h-2.5 bg-slate-100 rounded w-1/2" />
          <div className="h-3.5 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2">
          <div className="h-2.5 bg-slate-100 rounded w-1/2" />
          <div className="h-3.5 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  </div>
);

// ─── component ────────────────────────────────────────────────────────────────
export default function EvacuationList() {
  const [centers, setCenters]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [selected, setSelected]       = useState(null);
  const [sortBy, setSortBy]           = useState("name");
  const [filterStatus, setFilterStatus] = useState("All Status");

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

  const handleSubmit = async (form) => {
    if (selected) {
      await updateCenter(selected.evacuation_center_id, form);
    } else {
      await createCenter(form);
    }
    setModalOpen(false);
    fetchCenters();
  };

  const handleDelete = async () => {
    await deleteCenter(selected.evacuation_center_id);
    setDeleteOpen(false);
    fetchCenters();
  };

  const assignedCenterId = getAssignedCenterId();

  const processedCenters = centers
    .filter((c) => {
      const addrStr = (c.osm_address || "").toLowerCase();
      const matchesSearch = `${c.name} ${addrStr}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "All Status" || status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // 1. Force the assigned center to the top
      if (assignedCenterId) {
        if (a.evacuation_center_id === assignedCenterId) return -1;
        if (b.evacuation_center_id === assignedCenterId) return 1;
      }

      // 2. Fallback sorting
      if (sortBy === "name")
        return a.name.localeCompare(b.name);
      if (sortBy === "capacity")
        return (b.capacity ?? 0) - (a.capacity ?? 0);
      if (sortBy === "occupancy") {
        const rA = a.capacity ? (a.current_occupancy || 0) / a.capacity : 0;
        const rB = b.capacity ? (b.current_occupancy || 0) / b.capacity : 0;
        return rB - rA;
      }
      return 0;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Evacuation Centers</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Real-time Shelter Monitoring</p>
        </div>
        {canCreate && (
          <button
            onClick={() => { setSelected(null); setModalOpen(true); }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Add Center</span>
          </button>
        )}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Quick search centers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-colors"
          >
            <option value="All Status">All Status</option>
            <option value="Operational">Operational</option>
            <option value="High Occupancy">High Occupancy</option>
            <option value="Critical">Critical</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-colors"
          >
            <option value="name">Sort by Name</option>
            <option value="capacity">Sort by Capacity</option>
            <option value="occupancy">Sort by Occupancy</option>
          </select>
        </div>
      </div>

      {/* ACTIVE DUTY STATION QUICK LAUNCH */}
      {assignedCenterId && isPersonnel() && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/10">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Active Duty Station Assigned</p>
              <p className="text-xs text-slate-500">You are currently assigned to manage evacuation records for this center.</p>
            </div>
          </div>
          <Link
            to={`/evacuation-centers/${assignedCenterId}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 self-start sm:self-auto"
          >
            Launch Workstation <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => <CenterSkeleton key={i} />)
        ) : processedCenters.length > 0 ? (
          processedCenters.map((c) => {
            const current  = Number(c.current_occupancy) || 0;
            const max      = Number(c.capacity) || 0;
            const percent  = max ? (current / max) * 100 : 0;
            const addrStr  = c.osm_address || "Address not on record.";
            const isAssigned = c.evacuation_center_id === assignedCenterId;

            return (
              <div
                key={c.evacuation_center_id}
                className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden animate-in fade-in-50 duration-300 ${
                  isAssigned
                    ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg shadow-blue-500/5 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
                    : "border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                <div className="p-5 flex-1">

                  {/* TOP ROW */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                      isAssigned
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                    }`}>
                      <Home size={20} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isAssigned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-blue-50 border border-blue-200 text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          My Station
                        </span>
                      )}
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                        c.current_event
                          ? "text-blue-600 bg-blue-50 border-blue-100"
                          : "text-slate-500 bg-slate-100 border-slate-200"
                      }`}>
                        {c.current_event?.name || <span className="text-slate-400">No Active Event</span>}
                      </span>
                    </div>
                  </div>

                  {/* NAME */}
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{c.name}</h3>

                  {/* ADDRESS */}
                  <div className="flex items-start text-xs font-medium mb-1 gap-1">
                    <MapPin size={12} className="mt-0.5 shrink-0 text-blue-400" />
                    <span className="text-slate-400 leading-snug">{addrStr}</span>
                  </div>

                  {/* OCCUPANCY BAR */}
                  <div className="space-y-2 mb-5 mt-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      <span>Occupancy</span>
                      <span className="text-slate-800">{Math.round(percent)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* STAT TILES */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1.5">Evacuees</p>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-blue-500" />
                        <span className="text-xs font-bold text-slate-700">{current} / {max}</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1.5">Households</p>
                      <div className="flex items-center gap-2">
                        <DoorOpen size={14} className="text-indigo-500" />
                        <span className="text-xs font-bold text-slate-700">{c.household_count ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center group-hover:bg-white transition-colors">
                  <div className="flex gap-3">
                    {canEdit && (
                      <button
                        onClick={() => { setSelected(c); setModalOpen(true); }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tight"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => { setSelected(c); setDeleteOpen(true); }}
                        className="text-[11px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-tight"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <Link
                    to={`/evacuation-centers/${c.evacuation_center_id}`}
                    className="flex items-center gap-1 text-[11px] font-black text-slate-600 uppercase tracking-tighter hover:text-blue-600"
                  >
                    Manage <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-3">
            <AlertCircle className="mx-auto text-slate-300" size={32} />
            <h4 className="text-sm font-bold text-slate-700">No evacuation centers found</h4>
            <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      <CenterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selected}
      />
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
