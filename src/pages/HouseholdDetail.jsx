import { Loader2, XCircle } from 'lucide-react';
import MemberModal from '../components/households/MemberModal';
import HouseholdHeader from '../components/households/HouseholdHeader';
import HouseholdStats from '../components/households/HouseholdStats';
import EvacueeList from '../components/households/EvacueeList';
import CheckInModal from '../components/households/CheckInModal';
import { useHouseholdDetail } from '../hooks/useHouseholdDetail';

export default function HouseholdDetail() {
    const {
        navigate,
        household,
        loading,
        memberModal, setMemberModal,
        editingMember,
        statusUpdatingMemberId,
        activeEvacTab, setActiveEvacTab,
        memberSearch, setMemberSearch,
        checkInModal, setCheckInModal,
        
        isSuperAdminUser, isAdminUser, isPersonnelUser,
        povCenterId, canEdit, canDelete, isEvacuationContext,
        
        openAdd, openEdit, handleSave, handleDelete, handleMemberStatusChange, handleBack,
        
        allActiveEvacuations, isEvacuated, isScattered, personnelEvacuation,
        allEvacuatedMemberIds, memberEvacMap, filteredMembers,
        
        canModifyMember, getTabMembers, unverifiedMembers, activeTabEvacuation,
        isMyCenter, primaryEvacuation
    } = useHouseholdDetail();

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="animate-spin" size={36} />
                    <p className="text-xs font-bold uppercase tracking-widest">Loading household...</p>
                </div>
            </div>
        );
    }

    if (!household) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <XCircle size={48} className="text-red-200 mb-4" />
                <p className="text-base font-black text-slate-700 mb-1">Household Not Found</p>
                <p className="text-xs text-slate-400 mb-6">
                    This household does not exist or you don&apos;t have access to it.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-left">
            <HouseholdHeader 
                household={household}
                isEvacuationContext={isEvacuationContext}
                isEvacuated={isEvacuated}
                isScattered={isScattered}
                handleBack={handleBack}
            />

            <HouseholdStats 
                household={household}
                isEvacuated={isEvacuated}
                isScattered={isScattered}
                allActiveEvacuations={allActiveEvacuations}
                primaryEvacuation={primaryEvacuation}
                allEvacuatedMemberIds={allEvacuatedMemberIds}
            />

            <EvacueeList 
                household={household}
                isEvacuated={isEvacuated}
                isPersonnelUser={isPersonnelUser}
                isSuperAdminUser={isSuperAdminUser}
                isAdminUser={isAdminUser}
                memberSearch={memberSearch}
                setMemberSearch={setMemberSearch}
                canEdit={canEdit}
                openAdd={openAdd}
                allActiveEvacuations={allActiveEvacuations}
                activeEvacTab={activeEvacTab}
                setActiveEvacTab={setActiveEvacTab}
                unverifiedMembers={unverifiedMembers}
                isMyCenter={isMyCenter}
                getTabMembers={getTabMembers}
                activeTabEvacuation={activeTabEvacuation}
                filteredMembers={filteredMembers}
                memberEvacMap={memberEvacMap}
                canModifyMember={canModifyMember}
                povCenterId={povCenterId}
                statusUpdatingMemberId={statusUpdatingMemberId}
                setCheckInModal={setCheckInModal}
                personnelEvacuation={personnelEvacuation}
                handleMemberStatusChange={handleMemberStatusChange}
                openEdit={openEdit}
                canDelete={canDelete}
                handleDelete={handleDelete}
                allEvacuatedMemberIds={allEvacuatedMemberIds}
            />

            <CheckInModal 
                checkInModal={checkInModal}
                setCheckInModal={setCheckInModal}
                isPersonnelUser={isPersonnelUser}
                personnelEvacuation={personnelEvacuation}
                statusUpdatingMemberId={statusUpdatingMemberId}
                handleMemberStatusChange={handleMemberStatusChange}
                allActiveEvacuations={allActiveEvacuations}
            />

            {/* Member Modal */}
            <MemberModal
                open={memberModal}
                onClose={() => setMemberModal(false)}
                onSave={handleSave}
                editingMember={editingMember}
            />
        </div>
    );
}