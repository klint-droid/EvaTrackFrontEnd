import React, { useState, useMemo } from "react";
import { Phone, AlertCircle, MapPin } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  Checkbox,
  StatusBadge,
  RowMenu,
} from "../../ui/Table";

const UserRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-28" />
          <div className="h-2.5 bg-slate-50 dark:bg-slate-800/50 rounded w-14" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4"><div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-24" /></td>
    <td className="px-6 py-4 text-center"><div className="mx-auto h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" /></td>
    <td className="px-6 py-4"><div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-36" /></td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
        <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
      </div>
    </td>
  </tr>
);

export default function UserTable({
  users = [],
  loading,
  centers = [],
  pagination,
  fetchUsers,
  canEdit,
  canDelete,
  canAssign,
  setEditingUser,
  triggerDeleteUser,
  triggerAssignCenter,
  assigningUserId,
  formatPhone,
  getRoleBadge,
  getRoleLabel,
  selectedUsers = [],
  setSelectedUsers,
  onView,
}) {
  const [columnFilters, setColumnFilters] = useState({
    name: "",
    contact: "",
    role: "",
    center: "",
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.first_name || ""} ${u.last_name || ""} ${u.name || ""}`.toLowerCase();
      const phone = String(u.contact_number || "").toLowerCase();
      const role = String(u.role || "").toLowerCase();
      const centerId = String(u.assigned_center_id || "");

      if (columnFilters.name && !fullName.includes(columnFilters.name.toLowerCase())) return false;
      if (columnFilters.contact && !phone.includes(columnFilters.contact.toLowerCase())) return false;
      if (columnFilters.role && role !== columnFilters.role.toLowerCase()) return false;
      if (columnFilters.center) {
        if (columnFilters.center === "unassigned" && u.assigned_center_id) return false;
        if (columnFilters.center !== "unassigned" && centerId !== columnFilters.center) return false;
      }

      return true;
    });
  }, [users, columnFilters]);

  const allSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;
  const someSelected = selectedUsers.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.user_id));
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* ── DESKTOP TABLE VIEW (md+) ── */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <tr className="border-b border-gray-100 dark:border-slate-800">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleSelectAll}
                  ariaLabel="Select all users"
                />
              </TableHead>
              <TableHead
                filterable
                filterValue={columnFilters.name}
                onFilterChange={(val) => setColumnFilters((prev) => ({ ...prev, name: val }))}
              >
                Name
              </TableHead>
              <TableHead
                filterable
                filterValue={columnFilters.contact}
                onFilterChange={(val) => setColumnFilters((prev) => ({ ...prev, contact: val }))}
              >
                Contact
              </TableHead>
              <TableHead
                filterable
                filterValue={columnFilters.role}
                onFilterChange={(val) => setColumnFilters((prev) => ({ ...prev, role: val }))}
                filterOptions={[
                  { value: "evac_admin", label: "Admin" },
                  { value: "super_admin", label: "Super Admin" },
                  { value: "evac_personnel", label: "Evac Personnel" },
                ]}
              >
                Role
              </TableHead>
              <TableHead
                filterable
                filterValue={columnFilters.center}
                onFilterChange={(val) => setColumnFilters((prev) => ({ ...prev, center: val }))}
                filterOptions={[
                  { value: "unassigned", label: "Unassigned" },
                  ...centers.map((c) => ({
                    value: String(c.evacuation_center_id),
                    label: c.name,
                  })),
                ]}
              >
                Station Assignment
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <UserRowSkeleton key={i} />)
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan="6" className="px-6 py-16 text-center">
                  <AlertCircle className="mx-auto text-slate-300 mb-2" size={28} />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No personnel found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or column search terms.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isChecked = selectedUsers.includes(user.user_id);
                return (
                  <TableRow key={user.user_id} isSelected={isChecked} onClick={onView ? () => onView(user) : undefined} className="cursor-pointer">
                    <TableCell>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => toggleSelectUser(user.user_id)}
                        ariaLabel={`Select user ${user.user_id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {user.profile_photo_url ? (
                          <img
                            src={user.profile_photo_url}
                            alt={user.name}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold flex-shrink-0">
                            {(user.first_name || user.name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 leading-tight">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.name || "—"}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-400 leading-none">ID-{user.user_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <Phone size={13} className="text-gray-400" />
                        {formatPhone(user.contact_number)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={getRoleLabel(user.role)}
                        color={
                          user.role === "super_admin"
                            ? "red"
                            : user.role === "evac_admin"
                            ? "blue"
                            : "green"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {user.role === "evac_personnel" ? (
                        (() => {
                          const center = centers.find(
                            (c) => String(c.evacuation_center_id) === String(user.assigned_center_id)
                          );
                          return center ? (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                              <MapPin size={12} className="text-blue-400 flex-shrink-0" />
                              {center.name}
                            </div>
                          ) : (
                            <span className="text-xs italic text-slate-400 dark:text-slate-500">Unassigned</span>
                          );
                        })()
                      ) : (
                        <span className="text-gray-400 font-medium">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowMenu
                        onView={onView ? () => onView(user) : undefined}
                        onEdit={canEdit(user) ? () => setEditingUser(user) : undefined}
                        onDelete={canDelete(user) ? () => triggerDeleteUser(user.user_id) : undefined}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* ── MOBILE CARD VIEW (below md) ── */}
      <div className="md:hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-32" />
                    <div className="h-2.5 bg-slate-50 dark:bg-slate-800/50 rounded w-16" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
                  <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center">
            <AlertCircle className="mx-auto text-slate-300 mb-2" size={28} />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No personnel found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="p-3 sm:p-4 space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-all space-y-3 cursor-pointer hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700"
                onClick={onView ? () => onView(user) : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedUsers.includes(user.user_id)}
                      onChange={() => toggleSelectUser(user.user_id)}
                    />
                    {user.profile_photo_url ? (
                      <img
                        src={user.profile_photo_url}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-semibold flex-shrink-0">
                        {(user.first_name || user.name || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.name || "—"}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">ID-{user.user_id}</p>
                    </div>
                  </div>
                  <StatusBadge
                    label={getRoleLabel(user.role)}
                    color={
                      user.role === "super_admin"
                        ? "red"
                        : user.role === "evac_admin"
                        ? "blue"
                        : "green"
                    }
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Phone size={11} className="text-slate-300" />
                  {formatPhone(user.contact_number)}
                </div>

                {user.role === "evac_personnel" && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={11} className="text-slate-300" />
                    {(() => {
                      const center = centers.find(
                        (c) => String(c.evacuation_center_id) === String(user.assigned_center_id)
                      );
                      return center
                        ? <span className="font-medium text-slate-700 dark:text-slate-200">{center.name}</span>
                        : <span className="italic text-slate-400">Unassigned</span>;
                    })()}
                  </div>
                )}

                <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <RowMenu
                    onView={onView ? () => onView(user) : undefined}
                    onEdit={canEdit(user) ? () => setEditingUser(user) : undefined}
                    onDelete={canDelete(user) ? () => triggerDeleteUser(user.user_id) : undefined}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
