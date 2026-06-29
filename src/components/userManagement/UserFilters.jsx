import React from "react";
import { Search } from "lucide-react";

export default function UserFilters({ search, setSearch, roleFilter, setRoleFilter, fetchUsers, isSuperAdminUser }) {
    return (
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col md:flex-row gap-3 w-full">
                <div className="relative flex-1 group">
                    <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Search name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") fetchUsers(1, search, roleFilter);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer hover:border-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full md:w-auto"
                >
                    <option value="">All Roles</option>
                    <option value="evac_personnel">Personnel</option>
                    <option value="evac_admin">Admin</option>
                    {isSuperAdminUser && <option value="super_admin">Super Admin</option>}
                </select>
            </div>
        </div>
    );
}
