import { UserPlus } from "lucide-react";
import AlertConfirmModal from "../components/AlertConfirmModal";
import UserStats from "../components/userManagement/UserStats";
import UserFilters from "../components/userManagement/UserFilters";
import UserTable from "../components/userManagement/UserTable";
import UserModal from "../components/userManagement/UserModal";
import { useUserManagement } from "../hooks/useUserManagement";

const UserManagement = () => {
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

  return (
    <div className="min-h-screen font-sans text-left">
      
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-left">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 font-medium">Manage system access and station assignments</p>
        </div>

        {(isSuperAdminUser || isAdminUser) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200"
          >
            <UserPlus size={16} />
            <span>Add Personnel</span>
          </button>
        )}
      </div>

      <UserStats 
        totalUsers={totalUsers}
        adminCount={adminCount}
        personnelCount={personnelCount}
        assignedCount={assignedCount}
      />

      {/* ─── Table Container ─── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        <UserFilters 
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          fetchUsers={fetchUsers}
          isSuperAdminUser={isSuperAdminUser}
        />

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
        />
      </div>

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
    </div>
  );
};

export default UserManagement;
