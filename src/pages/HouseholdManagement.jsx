import {
    ChevronLeft, ChevronRight,
    Edit3,
    Eye,
    Home,
    Loader2,
    MoreHorizontal,
    Search,
    Trash2,
    Users,
    X
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { getCenters } from "../api/evacuation/getCenters";
import { deleteHousehold } from "../api/households/deleteHousehold";
import { getHouseholds } from "../api/households/getHouseholds";
import { updateHousehold } from "../api/households/updateHousehold";
import { getEvents } from "../api/events/getEvents";
import { isAdmin, isSuperAdmin } from "../utils/roles";

export default function HouseholdManagement() {
    const navigate = useNavigate();
    const isMounted = useRef(false);

    const [households, setHouseholds] = useState([]);
    const [centers, setCenters] = useState([]);
    const [events, setEvents] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingHousehold, setEditingHousehold] = useState(null);

    const [filters, setFilters] = useState({
        q: '',
        status: '',
        center_id: '',
        event_id: '',
    });
    const [searchInput, setSearchInput] = useState('');

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const isSuperAdminUser = isSuperAdmin();
    const isAdminUser = isAdmin();

    const canEditHousehold = (h) => {
        if (isSuperAdminUser || isAdminUser) return true;
        if (currentUser?.role === 'evac_personnel') {
            const currentEvac = h.current_evacuation || h.currentEvacuation;
            const currentCenterId = currentEvac?.center_id || currentEvac?.center?.evacuation_center_id;
            const assignedCenterId = currentUser?.assigned_center?.id || currentUser?.assigned_center_id;
            return !currentCenterId || currentCenterId === assignedCenterId;
        }
        return false;
    };

    const canDeleteHousehold = isSuperAdminUser || isAdminUser;

    const fetchHouseholds = async (page = 1, overrideFilters = null) => {
        setLoading(true);
        try {
            const activeFilters = overrideFilters ?? filters;
            const params = {};
            if (activeFilters.q) params.q = activeFilters.q;
            if (activeFilters.status) params.status = activeFilters.status;
            if (activeFilters.center_id) params.center_id = activeFilters.center_id;
            if (activeFilters.event_id) params.event_id = activeFilters.event_id;

            const res = await getHouseholds(page, params);
            setHouseholds(res.data);
            setPagination(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCenters = async () => {
        try {
            const res = await getCenters();
            const data = Array.isArray(res) ? res : (res?.data ?? []);
            setCenters(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await getEvents();
            const list = res.data || [];
            setEvents(list);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHouseholds(1, filters);
        fetchEvents();
        fetchCenters();
    }, []);

    // debounced search
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        const timeout = setTimeout(() => {
            const newFilters = { ...filters, q: searchInput };
            setFilters(newFilters);
            fetchHouseholds(1, newFilters);
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        fetchHouseholds(1, newFilters);
    };

    const handleUpdate = async () => {
        try {
            const res = await updateHousehold(editingHousehold.household_id, {
                household_name: editingHousehold.household_name,
                contact_number: editingHousehold.contact_number,
                member_count:   editingHousehold.member_count,
                barangay:       editingHousehold.address?.barangay,
                street:         editingHousehold.address?.street,
                purok:          editingHousehold.address?.purok,
                city:           editingHousehold.address?.city,
                province:       editingHousehold.address?.province,
                full_address:   editingHousehold.address?.full_address,
            });
            setHouseholds(prev =>
                prev.map(h =>
                    h.household_id === editingHousehold.household_id ? res.data : h
                )
            );
            setEditingHousehold(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed.');
        }
    };

    const handleDelete = async (householdId) => {
        if(!confirm('Are you sure you want to delete this household? This action cannot be undone.')) return;

        try{
            await deleteHousehold(householdId);
            fetchHouseholds(pagination.current_page);
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed.');
        }
    }
    const getStatusBadge = (household) => {
        const currentEvac = household.current_evacuation || household.currentEvacuation;
        const isEvacuated = currentEvac && (currentEvac.household_status_id === 2 || currentEvac.household_status_id === "2");
        const isReturned = currentEvac && (currentEvac.household_status_id === 6 || currentEvac.household_status_id === "6");

        if (isEvacuated) return 'bg-green-50 text-green-600 border-green-100';
        if (isReturned) return 'bg-blue-50 text-blue-600 border-blue-100';
        return 'bg-slate-50 text-slate-500 border-slate-100';
    };

    const getStatusLabel = (household) => {
        const currentEvac = household.current_evacuation || household.currentEvacuation;
        const isEvacuated = currentEvac && (currentEvac.household_status_id === 2 || currentEvac.household_status_id === "2");
        const isReturned = currentEvac && (currentEvac.household_status_id === 6 || currentEvac.household_status_id === "6");

        if (isEvacuated) return 'Evacuated';
        if (isReturned) return 'Returned';
        return 'Not Evacuated';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-left">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Household Status</h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                        Manage and monitor household evacuation status in your assigned evacuation center
                    </p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filters.event_id}
                        onChange={e => handleFilterChange('event_id', e.target.value)}
                        className="w-44 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                    >
                        <option value="">All Events</option>
                        {events.map(evt => (
                            <option key={evt.event_id} value={evt.event_id}>
                                {evt.name} {evt.ended_at ? "(Ended)" : "(Active)"}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={e => handleFilterChange('status', e.target.value)}
                        className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                    >
                        <option value="">All Status</option>
                        <option value="evacuated">Evacuated</option>
                        <option value="not_evacuated">Not Evacuated</option>
                    </select>
                    <select
                        value={filters.center_id}
                        onChange={e => handleFilterChange('center_id', e.target.value)}
                        className="w-48 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                    >
                        <option value="">All Centers</option>
                        {centers.map(c => (
                            <option key={c.evacuation_center_id} value={c.evacuation_center_id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Household</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Members</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Center / Unit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/55 flex-shrink-0" />
                                                <div className="space-y-2">
                                                    <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
                                                    <div className="w-20 h-2.5 bg-slate-100 rounded-sm" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-28 h-4 bg-slate-100 rounded-md" />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="w-10 h-4 bg-slate-100 rounded-md mx-auto" />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="w-24 h-6 bg-slate-100 rounded-full mx-auto" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <div className="w-36 h-3.5 bg-slate-100 rounded-md" />
                                                <div className="w-24 h-2.5 bg-slate-100/50 rounded-sm" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="w-16 h-4 bg-slate-100 rounded-md ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : households.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-slate-400 text-sm">
                                        No households found.
                                    </td>
                                </tr>
                            ) : households.map(h => (
                                <tr key={h.household_id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-white transition-colors">
                                                <Home size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                                                    {h.household_name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                                                    {h.household_id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">
                                            {h.contact_number || '—'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users size={13} className="text-blue-400" />
                                            <span className="text-sm font-bold text-slate-700">
                                                {h.members_count}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getStatusBadge(h)}`}>
                                            {getStatusLabel(h)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {h.current_evacuation ? (
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {h.current_evacuation.center?.name || '—'}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {h.current_evacuation.unit_allocation?.unit?.name || 'No unit assigned'}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/households/${h.household_id}`)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {canEditHousehold(h) ? (
                                                <button
                                                    onClick={() => setEditingHousehold({ ...h })}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Household Info"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="p-2 text-slate-300 cursor-not-allowed opacity-40"
                                                    title="Read-Only: Managed by assigned center"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            )}
                                            {canDeleteHousehold && (
                                                <button
                                                    onClick={() => handleDelete(h.household_id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="group-hover:hidden text-slate-300">
                                            <MoreHorizontal size={16} className="ml-auto" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Page {pagination.current_page || 1} of {pagination.last_page || 1}
                        {' · '}
                        {pagination.total || 0} total
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={!pagination.prev_page_url}
                            onClick={() => fetchHouseholds(pagination.current_page - 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={!pagination.next_page_url}
                            onClick={() => fetchHouseholds(pagination.current_page + 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* EDIT MODAL */}
            {editingHousehold && createPortal(
                <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
                        onClick={() => setEditingHousehold(null)}
                    />
                    <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <Edit3 size={16} className="text-blue-600" /> Edit Household
                            </h2>
                            <button
                                onClick={() => setEditingHousehold(null)}
                                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Basic Info */}
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Basic Info</p>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Household Name</label>
                                <input
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    value={editingHousehold.household_name || ''}
                                    onChange={e => setEditingHousehold({ ...editingHousehold, household_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                                <input
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    value={editingHousehold.contact_number || ''}
                                    onChange={e => setEditingHousehold({ ...editingHousehold, contact_number: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Member Count</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    value={editingHousehold.member_count || ''}
                                    onChange={e => setEditingHousehold({ ...editingHousehold, member_count: e.target.value })}
                                />
                            </div>

                            {/* Address */}
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-2">Address</p>

                            {[
                                { key: 'street', label: 'Street' },
                                { key: 'purok', label: 'Purok' },
                                { key: 'barangay', label: 'Barangay' },
                                { key: 'city', label: 'City' },
                                { key: 'province', label: 'Province' },
                            ].map(field => (
                                <div key={field.key} className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                        {field.label}
                                    </label>
                                    <input
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        value={editingHousehold.address?.[field.key] || ''}
                                        onChange={e => setEditingHousehold({
                                            ...editingHousehold,
                                            address: {
                                                ...editingHousehold.address,
                                                [field.key]: e.target.value
                                            }
                                        })}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingHousehold(null)}
                                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}