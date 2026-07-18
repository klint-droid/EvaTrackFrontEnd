import {
    Edit3,
    Eye,
    Home,
    MoreHorizontal,
    Search,
    Trash2,
    Users,
    Filter
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { getCenters } from "../api/evacuation/getCenters";
import { deleteHousehold } from "../api/households/deleteHousehold";
import { getHouseholds } from "../api/households/getHouseholds";
import { updateHousehold } from "../api/households/updateHousehold";
import { getEvents } from "../api/events/getEvents";
import { useUserStore } from "../store/useUserStore";
import { useAlert } from "../context/AlertContext";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "../ui/Table";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal";
import { TableLayout } from "../components/ui/TableLayout";
import { StatCard } from "../components/ui/StatCard";
import { Pagination } from "../components/ui/Pagination";
import { TableTabs } from "../components/ui/TableTabs";

export default function HouseholdManagement() {
    const navigate = useNavigate();
    const isMounted = useRef(false);
    const { showAlert, showConfirm } = useAlert();

    const [households, setHouseholds] = useState([]);
    const [centers, setCenters] = useState([]);
    const [events, setEvents] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingHousehold, setEditingHousehold] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        q: '',
        status: '',
        center_id: '',
        event_id: '',
    });
    const [searchInput, setSearchInput] = useState('');

    const currentUser = useUserStore(state => state.user);
    const fetchFreshUser = useUserStore(state => state.fetchFreshUser);
    const isSuperAdminUser = currentUser?.role === 'super_admin';
    const isAdminUser = currentUser?.role === 'evac_admin';

    const canEditHousehold = (h) => {
        if (isSuperAdminUser || isAdminUser) return true;
        if (currentUser?.role === 'evac_personnel') {
            const currentEvac = h.current_evacuation || h.currentEvacuation;
            const currentCenterId = currentEvac?.center_id || currentEvac?.center?.evacuation_center_id;
            const assignedCenterId = currentUser?.assigned_center?.id || currentUser?.assigned_center_id;
            return !currentCenterId || String(currentCenterId) === String(assignedCenterId);
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
        fetchFreshUser();
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
            showAlert(err.response?.data?.message || 'Update failed.', 'Update Error', 'danger');
        }
    };

    const handleDelete = async (householdId) => {
        showConfirm(
            'Are you sure you want to delete this household? This action cannot be undone.',
            async () => {
                try{
                    await deleteHousehold(householdId);
                    fetchHouseholds(pagination.current_page);
                } catch (err) {
                    showAlert(err.response?.data?.message || 'Delete failed.', 'Delete Error', 'danger');
                }
            },
            'Delete Household',
            'danger',
            'Delete'
        );
    };
    const getStatusBadge = (household) => {
        const currentEvac = household.current_evacuation || household.currentEvacuation;
        const isEvacuated = currentEvac && (currentEvac.household_status_id === 2 || currentEvac.household_status_id === "2");
        const isReturned = currentEvac && (currentEvac.household_status_id === 6 || currentEvac.household_status_id === "6");

        if (isEvacuated) return 'bg-green-50 text-green-600 border-green-100';
        if (isReturned) return 'bg-blue-50 text-blue-600 border-blue-100';
        return 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    };

    const getStatusLabel = (household) => {
        const currentEvac = household.current_evacuation || household.currentEvacuation;
        const isEvacuated = currentEvac && (currentEvac.household_status_id === 2 || currentEvac.household_status_id === "2");
        const isReturned = currentEvac && (currentEvac.household_status_id === 6 || currentEvac.household_status_id === "6");

        if (isEvacuated) return 'Evacuated';
        if (isReturned) return 'Returned';
        return 'Not Evacuated';
    };

    // ─── Computed Stats ───
    const totalHouseholds = pagination.total || households.length;
    const evacuatedCount = households.filter(h => {
        const evac = h.current_evacuation || h.currentEvacuation;
        return evac && (evac.household_status_id === 2 || evac.household_status_id === "2");
    }).length;
    const notEvacuatedCount = households.filter(h => {
        const evac = h.current_evacuation || h.currentEvacuation;
        return !evac || (evac.household_status_id !== 2 && evac.household_status_id !== "2");
    }).length;
    const totalMembers = households.reduce((sum, h) => sum + (h.current_evacuation ? h.current_evacuation.evacuated_count : (h.members_count || 0)), 0);

    const perPage = pagination.per_page || 10;
    const currentPage = pagination.current_page || 1;
    const totalPages = pagination.last_page || Math.ceil(households.length / perPage) || 1;

    const stats = (
        <>
            <StatCard title="Total Households" value={totalHouseholds} dotColor="#6366f1" />
            <StatCard title="Evacuated" value={evacuatedCount} dotColor="#10b981" />
            <StatCard title="Not Evacuated" value={notEvacuatedCount} dotColor="#f59e0b" />
            <StatCard title="Total Members" value={totalMembers} dotColor="#ef4444" />
        </>
    );

    const paginationComponent = (
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={totalHouseholds}
            perPage={perPage}
            onPageChange={(page) => fetchHouseholds(page)}
        />
    );

    const tabs = (
        <TableTabs
            tabs={[
                { key: "all", label: "All" },
                { key: "evacuated", label: "Evacuated" },
                { key: "not_evacuated", label: "Not Evacuated" },
            ]}
            activeTab={filters.status || "all"}
            onChange={(key) => {
                handleFilterChange('status', key === "all" ? "" : key);
            }}
        />
    );

    return (
        <div className="min-h-screen font-sans text-left pb-24 relative">
            <TableLayout
                title="Households"
                stats={stats}
                tabs={tabs}
                pagination={paginationComponent}
            >
                {/* FILTERS HEADER */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 sm:max-w-[280px]">
                            <Input
                                icon={Search}
                                placeholder="Search households..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 relative w-full lg:w-auto justify-end">

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                                (filters.event_id || filters.center_id) || showFilters
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:bg-slate-800/50'
                            }`}
                        >
                            <Filter size={16} />
                            <span className="hidden sm:inline">More Filters</span>
                            {(filters.event_id || filters.center_id) && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px]">
                                    {(filters.event_id ? 1 : 0) + (filters.center_id ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {/* Filters Popover */}
                        {showFilters && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Advanced Filters</h3>
                                    {(filters.event_id || filters.center_id) && (
                                        <button 
                                            onClick={() => {
                                                const newFilters = { ...filters, event_id: '', center_id: '' };
                                                setFilters(newFilters);
                                                fetchHouseholds(1, newFilters);
                                            }}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Event</label>
                                        <Select
                                            value={filters.event_id}
                                            onChange={e => handleFilterChange('event_id', e.target.value)}
                                            options={[
                                                { value: '', label: 'All Events' },
                                                ...events.map(evt => ({
                                                    value: evt.event_id,
                                                    label: `${evt.name} ${evt.ended_at ? "(Ended)" : "(Active)"}`
                                                }))
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Evacuation Center</label>
                                        <Select
                                            value={filters.center_id}
                                            onChange={e => handleFilterChange('center_id', e.target.value)}
                                            options={[
                                                { value: '', label: 'All Centers' },
                                                ...centers.map(c => ({
                                                    value: c.evacuation_center_id,
                                                    label: c.name
                                                }))
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <tr className="border-none">
                            {['Household', 'Contact', 'Members', 'Status', 'Center / Unit', 'Command'].map((h, i) => (
                                <TableHead key={h} className={`text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${i === 2 || i === 3 ? 'text-center' : ''} ${i === 5 ? 'text-right' : ''}`}>
                                    {h}
                                </TableHead>
                            ))}
                        </tr>
                    </TableHeader>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/55 flex-shrink-0" />
                                                <div className="space-y-2">
                                                    <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
                                                    <div className="w-20 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-sm" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-28 h-4 bg-slate-100 dark:bg-slate-800 rounded-md" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="w-10 h-4 bg-slate-100 dark:bg-slate-800 rounded-md mx-auto" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="w-24 h-6 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5">
                                                <div className="w-36 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-md" />
                                                <div className="w-24 h-2.5 bg-slate-100/50 rounded-sm" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="w-16 h-4 bg-slate-100 dark:bg-slate-800 rounded-md ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : households.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="6" className="py-20 text-center text-slate-400 text-sm">
                                        No households found.
                                    </TableCell>
                                </TableRow>
                            ) : households.map(h => (
                                <TableRow key={h.household_id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:bg-slate-900 transition-colors">
                                                <Home size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none mb-1">
                                                    {h.household_name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                                                    {h.household_id}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            {h.contact_number || '—'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users size={13} className="text-blue-400" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {h.current_evacuation ? h.current_evacuation.evacuated_count : h.members_count}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getStatusBadge(h)}`}>
                                            {getStatusLabel(h)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {h.current_evacuation ? (
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                    {h.current_evacuation.center?.name || '—'}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {h.current_evacuation.unit_allocation?.unit?.name || 'No unit assigned'}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => navigate(`/households/${h.household_id}`)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {canEditHousehold(h) ? (
                                                <button
                                                    disabled={!h.household_id?.startsWith('NHH-')}
                                                    onClick={() => setEditingHousehold({ ...h })}
                                                    className={`p-1.5 rounded-lg transition-all ${h.household_id?.startsWith('NHH-') ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'text-slate-300 cursor-not-allowed opacity-50'}`}
                                                    title={h.household_id?.startsWith('NHH-') ? "Edit Household Info" : "Official record from barangay: Cannot edit"}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="p-1.5 text-slate-300 cursor-not-allowed opacity-40"
                                                    title="Read-Only: Managed by assigned center"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            )}
                                            {canDeleteHousehold && (
                                                <button
                                                    disabled={!h.household_id?.startsWith('NHH-')}
                                                    onClick={() => handleDelete(h.household_id)}
                                                    className={`p-1.5 rounded-lg transition-all ${h.household_id?.startsWith('NHH-') ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-slate-300 cursor-not-allowed opacity-50'}`}
                                                    title={h.household_id?.startsWith('NHH-') ? "Delete" : "Official record from barangay: Cannot delete"}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <button className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 rounded-lg transition-all">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </tbody>
                    </Table>
            </TableLayout>

            {/* EDIT MODAL */}
            <Modal
                isOpen={!!editingHousehold}
                onClose={() => setEditingHousehold(null)}
                title={
                    <div className="flex items-center gap-2">
                        <Edit3 size={16} className="text-blue-600" /> Edit Household
                    </div>
                }
            >
                {editingHousehold && (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {/* Basic Info */}
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Basic Info</p>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Household Name</label>
                            <Input
                                value={editingHousehold.household_name || ''}
                                onChange={e => setEditingHousehold({ ...editingHousehold, household_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                            <Input
                                value={editingHousehold.contact_number || ''}
                                onChange={e => setEditingHousehold({ ...editingHousehold, contact_number: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Member Count</label>
                            <Input
                                type="number"
                                min="1"
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
                                <Input
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

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setEditingHousehold(null)}
                                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg dark:shadow-none uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}