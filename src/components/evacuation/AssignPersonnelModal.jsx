import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getUsers } from '../../api/users/getUsers';
import { assignCenter } from '../../api/users/assignCenter';
import { getCenters } from '../../api/evacuation/getCenters';
import AlertConfirmModal from '../AlertConfirmModal';
import { ShieldAlert, ShieldCheck, Search, Users, X, Loader2 } from 'lucide-react';

export default function AssignPersonnelModal({ center, onClose, onSaved }) {
    const [users, setUsers] = useState([]);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'assigned_here' | 'available' | 'other'
    const [error, setError] = useState(null);

    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        type: 'assign', // 'assign' | 'unassign'
        user: null,
        isLoading: false
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersRes, centersRes] = await Promise.all([
                getUsers(1, '', 'evac_personnel'),
                getCenters()
            ]);
            const userList = Array.isArray(usersRes?.data) ? usersRes.data : Array.isArray(usersRes) ? usersRes : [];
            setUsers(userList);

            const centerList = Array.isArray(centersRes?.data) ? centersRes.data : Array.isArray(centersRes) ? centersRes : [];
            setCenters(centerList);
        } catch {
            setError('Failed to load personnel data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const centerMap = useMemo(() => {
        const map = {};
        centers.forEach(c => {
            map[c.evacuation_center_id] = c.name;
        });
        return map;
    }, [centers]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const fullName = `${u.first_name || ''} ${u.last_name || ''} ${u.name || ''}`.toLowerCase();
            const contact = String(u.contact_number || '').toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || contact.includes(searchTerm.toLowerCase());

            const isAssignedHere = String(u.assigned_center_id) === String(center.evacuation_center_id);
            const isAvailable = !u.assigned_center_id;
            const isOther = u.assigned_center_id && !isAssignedHere;

            if (!matchesSearch) return false;
            if (filterTab === 'assigned_here') return isAssignedHere;
            if (filterTab === 'available') return isAvailable;
            if (filterTab === 'other') return isOther;

            return true;
        });
    }, [users, searchTerm, filterTab, center]);

    const openConfirm = (type, user) => {
        setConfirmState({
            isOpen: true,
            type,
            user,
            isLoading: false
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmState.user) return;
        setConfirmState(prev => ({ ...prev, isLoading: true }));
        setError(null);

        try {
            if (confirmState.type === 'assign') {
                await assignCenter(confirmState.user.user_id, center.evacuation_center_id);
            } else {
                await assignCenter(confirmState.user.user_id, null);
            }
            onSaved?.();
            await fetchData();
            setConfirmState(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${confirmState.type} personnel.`);
            setConfirmState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const assignedCount = users.filter(u => String(u.assigned_center_id) === String(center.evacuation_center_id)).length;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in p-4 sm:p-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Users size={16} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Assign Personnel</h2>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Managing staff deployment for <span className="font-bold text-slate-800 dark:text-slate-200">{center.name}</span>
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                {assignedCount} active personnel
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">{error}</div>}

                {/* Search and Tabs */}
                <div className="mt-4 space-y-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search personnel by name or contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setFilterTab('all')}
                            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${filterTab === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'hover:text-slate-900 dark:hover:text-slate-100'}`}
                        >
                            All ({users.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab('assigned_here')}
                            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${filterTab === 'assigned_here' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'hover:text-slate-900 dark:hover:text-slate-100'}`}
                        >
                            Assigned Here ({assignedCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab('available')}
                            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${filterTab === 'available' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'hover:text-slate-900 dark:hover:text-slate-100'}`}
                        >
                            Available ({users.filter(u => !u.assigned_center_id).length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab('other')}
                            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${filterTab === 'other' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'hover:text-slate-900 dark:hover:text-slate-100'}`}
                        >
                            Other Stations ({users.filter(u => u.assigned_center_id && String(u.assigned_center_id) !== String(center.evacuation_center_id)).length})
                        </button>
                    </div>
                </div>

                {/* Personnel List */}
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 gap-2">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                        <span className="text-slate-400 text-xs font-bold">Loading personnel registry...</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-12 text-center">
                        <span className="text-slate-400 text-xs font-medium">No personnel found matching criteria.</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-1 mt-3 space-y-2.5 custom-scrollbar min-h-0">
                        {filteredUsers.map(user => {
                            const isAssignedToThis = String(user.assigned_center_id) === String(center.evacuation_center_id);
                            const otherCenterName = user.assigned_center_id ? (centerMap[user.assigned_center_id] || user.assigned_center_id) : null;

                            return (
                                <div
                                    key={user.user_id}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                        isAssignedToThis
                                            ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                            isAssignedToThis
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}>
                                            {(user.first_name?.[0] || user.name?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {user.contact_number || user.user_id}
                                                </span>
                                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                                {isAssignedToThis ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                        <ShieldCheck size={11} /> Stationed here
                                                    </span>
                                                ) : user.assigned_center_id ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 truncate max-w-[150px]" title={`Assigned to ${otherCenterName}`}>
                                                        <ShieldAlert size={11} /> at {otherCenterName}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                        Available
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0">
                                        {isAssignedToThis ? (
                                            <button
                                                type="button"
                                                onClick={() => openConfirm('unassign', user)}
                                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-rose-600 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shadow-xs"
                                            >
                                                Unassign
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => openConfirm('assign', user)}
                                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
                                            >
                                                {user.assigned_center_id ? 'Reassign Here' : 'Assign'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>

            <AlertConfirmModal
                isOpen={confirmState.isOpen}
                title={confirmState.type === 'assign' ? 'Assign Personnel' : 'Unassign Personnel'}
                message={
                    confirmState.type === 'assign'
                        ? `Are you sure you want to assign ${confirmState.user?.first_name || confirmState.user?.name} to ${center.name}?`
                        : `Are you sure you want to unassign ${confirmState.user?.first_name || confirmState.user?.name} from ${center.name}?`
                }
                confirmText={confirmState.type === 'assign' ? 'Yes, Assign' : 'Yes, Unassign'}
                cancelText="Cancel"
                type={confirmState.type === 'assign' ? 'success' : 'danger'}
                isLoading={confirmState.isLoading}
                onConfirm={handleConfirmAction}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
