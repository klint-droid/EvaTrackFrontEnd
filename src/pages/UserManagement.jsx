import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import AnimatedFAB from "../components/ui/AnimatedFAB";
import AlertConfirmModal from "../components/AlertConfirmModal";
import UserStats from "../components/userManagement/UserStats";
import UserTable from "../components/userManagement/UserTable";
import UserDetailsDrawer from "../components/userManagement/UserDetailsDrawer";
import UserModal from "../components/userManagement/UserModal";
import { useUserManagement } from "../hooks/useUserManagement";
import { TableLayout } from "../components/ui/TableLayout";
import { TableTabs } from "../components/ui/TableTabs";
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

    search, setSearch,
    roleFilter, setRoleFilter,
    
    newUser, setNewUser,
    roleOptions,
    
    isAdminUser, isSuperAdminUser,
    
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


  const stats = (
    <UserStats 
      totalUsers={totalUsers}
      adminCount={adminCount}
      personnelCount={personnelCount}
      assignedCount={assignedCount}
    />
  );

  const tabs = (
    <TableTabs
      tabs={[
        { key: "all", label: "All" },
        { key: "evac_admin", label: "Admin" },
        { key: "super_admin", label: "Super Admin" },
        { key: "evac_personnel", label: "Evac Personnel" },
      ]}
      activeTab={roleFilter || "all"}
      onChange={(key) => {
        setRoleFilter(key === "all" ? "" : key);
        setSelectedUsers([]);
      }}
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
        onPageChange={(page) => fetchUsers(page, search, roleFilter)} 
    />
  );

  return (
    <div className="min-h-screen font-sans text-left pb-24 relative">
      
      {selectedUsers.length > 0 && (
        <BulkActionBar 
          selectedCount={selectedUsers.length} 
          onClear={() => setSelectedUsers([])} 
          onDelete={() => {
            selectedUsers.forEach(id => triggerDeleteUser(id));
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
        onExport={() => {
          const csvHeader = "User ID,Name,Contact,Role,Station Assignment\n";
          const csvRows = users
            .map((u) => `${u.user_id},"${u.first_name || u.name || ''} ${u.last_name || ''}",${u.contact_number || ''},${u.role || ''},"${u.assigned_center_id || 'Unassigned'}"`)
            .join("\n");
          const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "personnel_report.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        onAdd={(isSuperAdminUser || isAdminUser) ? () => setShowCreateModal(true) : undefined}
        addLabel="Add Personnel"
        stats={stats}
        tabs={tabs}
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
          onView={(user) => setViewingUser(user)}
        />
      </TableLayout>

      {/* ─── Details Drawer ─── */}
      {viewingUserFresh && (
        <UserDetailsDrawer
          user={viewingUserFresh}
          centers={centers}
          onClose={() => setViewingUser(null)}
          canEdit={canEdit}
          canDelete={canDelete}
          canAssign={canAssign}
          onEdit={(user) => { setViewingUser(null); setEditingUser(user); }}
          onDelete={(id) => { setViewingUser(null); triggerDeleteUser(id); }}
          triggerAssignCenter={triggerAssignCenter}
          assigningUserId={assigningUserId}
          getRoleLabel={getRoleLabel}
          formatPhone={formatPhone}
        />
      )}

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
        message="Are you sure you want to delete this personnel account? This action is permanent and will immediately terminate their system access and shelter credentials."
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
        message={`Are you sure you want to register ${newUser.first_name} ${newUser.last_name} as ${getRoleLabel(newUser.role)}?`}
        confirmText="Register"
        cancelText="Cancel"
        type="success"
        isLoading={createConfirmState.isLoading}
        onConfirm={handleCreateUser}
        onClose={() => setCreateConfirmState({ isOpen: false, isLoading: false })}
      />

      {/* ─── Update Confirmation ─── */}
      <AlertConfirmModal
        isOpen={updateConfirmState.isOpen}
        title="Apply Changes"
        message={`Are you sure you want to apply these changes to ${editingUser?.first_name} ${editingUser?.last_name}?`}
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
        title="Assign Station"
        message={`Are you sure you want to change the station assignment for this personnel?`}
        confirmText="Confirm Assignment"
        cancelText="Cancel"
        type="info"
        isLoading={assignConfirmState.isLoading}
        onConfirm={handleAssignCenter}
        onClose={() => setAssignConfirmState({ isOpen: false, userId: null, centerId: null, isLoading: false })}
      />

      {/* ─── Floating Action Button ─── */}
      {(isSuperAdminUser || isAdminUser) && (
        <AnimatedFAB 
          icon={UserPlus}
          label="Add Personnel"
          onClick={() => setShowCreateModal(true)}
        />
      )}
    </div>
  );
};

export default UserManagement;
