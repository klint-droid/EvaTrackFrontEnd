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
import { Table, TableHeader, TableRow, TableHead, TableCell, StatusBadge, RowMenu } from "../ui/Table";
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard title="Total Households" value={totalHouseholds} dotColor="#6366f1" />
            <StatCard title="Evacuated" value={evacuatedCount} dotColor="#10b981" />
            <StatCard title="Not Evacuated" value={notEvacuatedCount} dotColor="#f59e0b" />
            <StatCard title="Total Members" value={totalMembers} dotColor="#ef4444" />
        </div>
    );

    const paginationComponent = (
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={totalHouseholds}
            perPage={perPage}
            onPageChange={(page) => fetchHouseholds(page)}
        />
    );    return (
        <div className="min-h-screen font-sans text-left pb-24">
            <TableLayout
                title="Households"
                badgeText={`${pagination.total || households.length} Households`}
                subtitle="Manage registered family units, contact info, and evacuation statuses"
                onExport={() => {
                  const csvHeader = "Household ID,Household Name,Contact Number,Members Count,Status,Center\n";
                  const csvRows = households
                    .map((h) => `${h.household_id},"${h.household_name || ''}",${h.contact_number || ''},${h.current_evacuation ? h.current_evacuation.evacuated_count : h.members_count},${getStatusLabel(h)},"${h.current_evacuation?.center?.name || ''}"`)
                    .join("\n");
                  const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.setAttribute("download", "household_reports.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                onAdd={(isAdminUser || isSuperAdminUser) ? () => navigate('/households/register') : undefined}
                addLabel="Register Household"
                stats={stats}
                pagination={paginationComponent}
            >
                <Table>
                    <TableHeader>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <TableHead
                              filterable
                              filterValue={filters.q}
                              onFilterChange={(val) => {
                                const newFilters = { ...filters, q: val };
                                setFilters(newFilters);
                                fetchHouseholds(1, newFilters);
                              }}
                            >
                              Household
                            </TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="text-center">Members</TableHead>
                            <TableHead
                              filterable
                              filterValue={filters.status}
                              onFilterChange={(val) => handleFilterChange('status', val)}
                              filterOptions={[
                                { value: "evacuated", label: "Evacuated" },
                                { value: "not_evacuated", label: "Home / Safe" },
                                { value: "unverified", label: "Unverified" },
                              ]}
                            >
                              Status
                            </TableHead>
                            <TableHead
                              filterable
                              filterValue={filters.center_id}
                              onFilterChange={(val) => handleFilterChange('center_id', val)}
                              filterOptions={centers.map(c => ({ value: c.evacuation_center_id, label: c.name }))}
                            >
                              Center / Unit
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </tr>
                    </TableHeader>
                    <tbody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0" />
                                            <div className="space-y-1">
                                                <div className="w-28 h-3 bg-slate-200 rounded" />
                                                <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded" /></TableCell>
                                    <TableCell className="text-center"><div className="w-8 h-3 bg-slate-100 dark:bg-slate-800 rounded mx-auto" /></TableCell>
                                    <TableCell className="text-center"><div className="w-20 h-5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto" /></TableCell>
                                    <TableCell><div className="w-28 h-3 bg-slate-100 dark:bg-slate-800 rounded" /></TableCell>
                                    <TableCell className="text-right"><div className="w-12 h-4 bg-slate-100 dark:bg-slate-800 rounded ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : households.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan="6" className="py-14 text-center text-slate-400 text-xs">
                                    No households found.
                                </TableCell>
                            </TableRow>
                        ) : households.map(h => (
                            <TableRow key={h.household_id} className="group">
                                <TableCell>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                            <Home size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                                                {h.household_name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-mono leading-none">
                                                {h.household_id}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                                    {h.contact_number || '—'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Users size={12} className="text-blue-400" />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                            {h.current_evacuation
                                                ? <><span className="text-green-600 dark:text-green-400 font-bold">{h.current_evacuation.evacuated_count}</span> <span className="text-slate-400">/</span> {h.member_count || h.members_count || '?'}</>
                                                : (h.members_count || h.member_count || 0)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <StatusBadge
                                        value={getStatusLabel(h)}
                                        color={
                                            getStatusLabel(h) === 'Evacuated' ? "green"
                                            : getStatusLabel(h) === 'Returned' ? "blue"
                                            : "orange"
                                        }
                                    />
                                </TableCell>
                                <TableCell className="text-xs">
                                    {h.current_evacuation ? (
                                        <div>
                                            <p className="font-medium text-slate-700 dark:text-slate-200 leading-tight">
                                                {h.current_evacuation.center?.name || '—'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 leading-none">
                                                {h.current_evacuation.unit_allocation?.unit?.name || 'No unit assigned'}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <RowMenu
                                        onView={() => navigate(`/households/${h.household_id}`)}
                                        onEdit={canEditHousehold(h) && h.household_id?.startsWith('NHH-') ? () => setEditingHousehold({ ...h }) : undefined}
                                        onDelete={canDeleteHousehold && h.household_id?.startsWith('NHH-') ? () => handleDelete(h.household_id) : undefined}
                                    />
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