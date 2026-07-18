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
            <div className="space-y-6 animate-pulse text-left">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                        <div className="space-y-2">
                            <div className="w-48 h-6 bg-slate-200 rounded-md" />
                            <div className="w-32 h-4 bg-slate-100 dark:bg-slate-800 rounded-md" />
                        </div>
                    </div>
                    <div className="w-24 h-10 bg-slate-200 rounded-xl" />
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 shadow-sm dark:shadow-none">
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                            <div className="w-16 h-8 bg-slate-200 rounded-md" />
                            <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded-md" />
                        </div>
                    ))}
                </div>

                {/* List Skeleton */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-32 h-5 bg-slate-200 rounded-md" />
                        <div className="w-24 h-8 bg-slate-200 rounded-lg" />
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                                <div className="space-y-2">
                                    <div className="w-32 h-4 bg-slate-200 rounded-md" />
                                    <div className="w-20 h-3 bg-slate-100 dark:bg-slate-800 rounded-md" />
                                </div>
                            </div>
                            <div className="w-16 h-6 bg-slate-200 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!household) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <XCircle size={48} className="text-red-200 mb-4" />
                <p className="text-base font-black text-slate-700 dark:text-slate-200 mb-1">Household Not Found</p>
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