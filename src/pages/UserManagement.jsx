import React, { useState } from "react";
import { User, MapPin, Shield, ArrowRight } from "lucide-react";
import AlertConfirmModal from "../components/AlertConfirmModal";
import UserStats from "../components/userManagement/UserStats";
import UserTable from "../components/userManagement/UserTable";
import UserDetailsDrawer from "../components/userManagement/UserDetailsDrawer";
import UserModal from "../components/userManagement/UserModal";
import { useUserManagement } from "../hooks/useUserManagement";
import { TableLayout } from "../components/ui/TableLayout";
import { BulkActionBar } from "../components/ui/BulkActionBar";
import { Pagination } from "../components/ui/Pagination";

const UserManagement = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);

  const {
    users, centers, pagination,
    editingUser, setEditingUser,
    showCreateModal, setShowCreateModal,
    assigningUserId, loading,

    deleteConfirmState, setDeleteConfirmState,
    createConfirmState, setCreateConfirmState,
    updateConfirmState, setUpdateConfirmState,
    assignConfirmState, setAssignConfirmState,

    search,

    newUser, setNewUser,
    roleOptions,

    isSuperAdminUser,

    canEdit, canDelete, canAssign,

    fetchUsers,
    triggerCreateUser, handleCreateUser,
    triggerUpdateUser, handleUpdateUser,
    triggerDeleteUser, handleDeleteUser,
    triggerAssignCenter, handleAssignCenter,

    getRoleBadge, getRoleLabel, formatPhone,

    totalUsers, personnelCount, adminCount, assignedCount
  } = useUserManagement();

  // Keep drawer in sync: re-derive from live users list after any update
  const viewingUserFresh = viewingUser
    ? (users.find((u) => u.user_id === viewingUser.user_id) ?? viewingUser)
    : null;

  // Resolve target user & evacuation center for confirmation modals
  const getDisplayName = (u) => {
    if (!u) return "this personnel";
    const full = `${u.first_name || ""} ${u.last_name || ""}`.trim();
    return full || u.name || "this personnel";
  };

  const assigningUser =
    users.find((u) => String(u.user_id) === String(assignConfirmState.userId)) ||
    (viewingUserFresh && String(viewingUserFresh.user_id) === String(assignConfirmState.userId)
      ? viewingUserFresh
      : null);
  const assigningUserName = getDisplayName(assigningUser);
  const assigningCenter = centers.find(
    (c) => String(c.evacuation_center_id) === String(assignConfirmState.centerId)
  );
  const assigningCenterName = assigningCenter?.name || "";

  const deletingUser =
    users.find((u) => String(u.user_id) === String(deleteConfirmState.userId)) ||
    (viewingUserFresh && String(viewingUserFresh.user_id) === String(deleteConfirmState.userId)
      ? viewingUserFresh
      : null);
  const deletingUserName = deletingUser ? getDisplayName(deletingUser) : null;

  const newUserCenter = centers.find(
    (c) => String(c.evacuation_center_id) === String(newUser.assigned_center_id)
  );
  const editingUserCenter = centers.find(
    (c) => String(c.evacuation_center_id) === String(editingUser?.assigned_center_id)
  );

  const stats = (
    <UserStats
      totalUsers={totalUsers}
      adminCount={adminCount}
      personnelCount={personnelCount}
      assignedCount={assignedCount}
    />
  );

  const perPage = pagination.per_page || 10;
  const currentPage = pagination.current_page || 1;
  const totalPages = pagination.last_page || Math.ceil(users.length / perPage) || 1;
  const totalEntries = pagination.total || users.length;

  const paginationComponent = (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalEntries={totalEntries}
      perPage={perPage}
      onPageChange={(page) => fetchUsers(page, search)}
    />
  );

  return (
    <div className="flex items-start min-h-[calc(100vh-3.5rem)] font-sans text-left relative">
      {/* ─── Left Column: Main Content (shifts left when detail panel is open) ─── */}
      <div
        className={`flex-1 min-w-0 p-4 sm:p-6 pb-24 lg:pb-8 space-y-6 transition-all duration-300 ${
          viewingUserFresh ? "max-w-none" : "max-w-6xl mx-auto"
        }`}
      >
        {selectedUsers.length > 0 && (
          <BulkActionBar
            selectedCount={selectedUsers.length}
            onClear={() => setSelectedUsers([])}
            onDelete={() => {
              selectedUsers.forEach((id) => triggerDeleteUser(id));
              setSelectedUsers([]);
            }}
          />
        )}

        <TableLayout
          title="User Management"
          badgeText={`${totalEntries} Personnel`}
          subtitle="Manage system accounts, roles, and station assignments"
          selectedCount={selectedUsers.length}
          onDeleteSelected={() => {
            selectedUsers.forEach((id) => triggerDeleteUser(id));
            setSelectedUsers([]);
          }}
          onAdd={isSuperAdminUser ? () => setShowCreateModal(true) : undefined}
          addLabel="Add Personnel"
          stats={stats}
          pagination={paginationComponent}
        >
          <UserTable
            users={users}
            loading={loading}
            centers={centers}
            pagination={pagination}
            fetchUsers={fetchUsers}
            canEdit={canEdit}
            canDelete={canDelete}
            canAssign={canAssign}
            setEditingUser={setEditingUser}
            triggerDeleteUser={triggerDeleteUser}
            triggerAssignCenter={triggerAssignCenter}
            assigningUserId={assigningUserId}
            formatPhone={formatPhone}
            getRoleBadge={getRoleBadge}
            getRoleLabel={getRoleLabel}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            viewingUser={viewingUserFresh}
            onView={(user) => setViewingUser(user)}
          />
        </TableLayout>
      </div>

      {/* ─── View & Update Details Inline Side Panel (Jira-Style like Issue Reports) ─── */}
      <UserDetailsDrawer
        user={viewingUserFresh}
        centers={centers}
        onClose={() => setViewingUser(null)}
        canEdit={canEdit}
        canDelete={canDelete}
        canAssign={canAssign}
        onEdit={(user) => setEditingUser(user)}
        onDelete={(id) => {
          setViewingUser(null);
          triggerDeleteUser(id);
        }}
        triggerAssignCenter={triggerAssignCenter}
        assigningUserId={assigningUserId}
        assignConfirmOpen={assignConfirmState.isOpen}
        getRoleLabel={getRoleLabel}
        formatPhone={formatPhone}
      />

      {/* ─── Create Personnel Modal ─── */}
      <UserModal
        isOpen={showCreateModal}
        isEditMode={false}
        onClose={() => setShowCreateModal(false)}
        formData={newUser}
        setFormData={setNewUser}
        roleOptions={roleOptions}
        isSuperAdminUser={isSuperAdminUser}
        centers={centers}
        onConfirm={triggerCreateUser}
      />

      {/* ─── Edit Personnel Modal ─── */}
      <UserModal
        isOpen={!!editingUser}
        isEditMode={true}
        onClose={() => setEditingUser(null)}
        formData={editingUser || {}}
        setFormData={setEditingUser}
        roleOptions={roleOptions}
        isSuperAdminUser={isSuperAdminUser}
        centers={centers}
        onConfirm={triggerUpdateUser}
      />

      {/* ─── Delete Confirmation ─── */}
      <AlertConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title="Delete Personnel Account"
        subtitle="Permanent account removal"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-black text-slate-900 dark:text-white">
              {deletingUserName || "this personnel"}
            </span>
            &apos;s account? This action is permanent and will immediately terminate their system access and shelter credentials.
          </>
        }
        confirmText="Delete Account"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteConfirmState.isLoading}
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteConfirmState({ isOpen: false, userId: null, isLoading: false })}
      />

      {/* ─── Create Confirmation ─── */}
      <AlertConfirmModal
        isOpen={createConfirmState.isOpen}
        title="Register Personnel"
        subtitle="Confirm new personnel registration"
        message={
          <>
            Are you sure you want to register{" "}
            <span className="font-black text-slate-900 dark:text-white">
              {newUser.first_name} {newUser.last_name}
            </span>{" "}
            as{" "}
            <span className="font-black text-blue-600 dark:text-blue-400">
              {getRoleLabel(newUser.role)}
            </span>
            {newUserCenter && newUser.role !== "super_admin" ? (
              <>
                {" "}and assign to{" "}
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {newUserCenter.name}
                </span>
              </>
            ) : null}
            ?
          </>
        }
        confirmText="Register Personnel"
        cancelText="Cancel"
        type="success"
        isLoading={createConfirmState.isLoading}
        onConfirm={handleCreateUser}
        onClose={() => setCreateConfirmState({ isOpen: false, isLoading: false })}
      />

      {/* ─── Update Confirmation ─── */}
      <AlertConfirmModal
        isOpen={updateConfirmState.isOpen}
        title="Apply Personnel Changes"
        subtitle="Confirm updates to personnel profile"
        message={
          <>
            Are you sure you want to apply these changes to{" "}
            <span className="font-black text-slate-900 dark:text-white">
              {editingUser?.first_name} {editingUser?.last_name}
            </span>
            {editingUserCenter && editingUser?.role !== "super_admin" ? (
              <>
                {" "}(assigned to{" "}
                <span className="font-black text-blue-600 dark:text-blue-400">
                  {editingUserCenter.name}
                </span>
                )
              </>
            ) : null}
            ?
          </>
        }
        confirmText="Apply Changes"
        cancelText="Cancel"
        type="info"
        isLoading={updateConfirmState.isLoading}
        onConfirm={handleUpdateUser}
        onClose={() => setUpdateConfirmState({ isOpen: false, isLoading: false })}
      />

      {/* ─── Assign Center Confirmation ─── */}
      <AlertConfirmModal
        isOpen={assignConfirmState.isOpen}
        title={assigningCenterName ? "Assign Evacuation Center" : "Unassign Evacuation Center"}
        subtitle={
          assigningCenterName
            ? "Confirm station assignment for this personnel"
            : "Remove current station assignment"
        }
        message={
          assigningCenterName ? (
            <>
              Are you sure you want to assign{" "}
              <span className="font-black text-slate-900 dark:text-white">
                {assigningUserName}
              </span>{" "}
              to{" "}
              <span className="font-black text-blue-600 dark:text-blue-400">
                {assigningCenterName}
              </span>
              ?
            </>
          ) : (
            <>
              Are you sure you want to unassign{" "}
              <span className="font-black text-slate-900 dark:text-white">
                {assigningUserName}
              </span>{" "}
              from their current evacuation center?
            </>
          )
        }
        confirmText={assigningCenterName ? "Confirm Assignment" : "Unassign Station"}
        cancelText="Cancel"
        type="info"
        isLoading={assignConfirmState.isLoading}
        onConfirm={handleAssignCenter}
        onClose={() =>
          setAssignConfirmState({ isOpen: false, userId: null, centerId: null, isLoading: false })
        }
      >
        {/* Visual Assignment Summary Card */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#141b29] border border-slate-200/80 dark:border-[#1e2a3d]">
            <div className="flex items-center gap-2 min-w-0">
              <User size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Personnel
              </span>
            </div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate ml-2">
              {assigningUserName}
            </span>
          </div>

          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={14} className="text-blue-500 flex-shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Evacuation Center
              </span>
            </div>
            <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 truncate ml-2">
              {assigningCenterName || "Unassigned"}
            </span>
          </div>
        </div>
      </AlertConfirmModal>
    </div>
  );
};

export default UserManagement;
