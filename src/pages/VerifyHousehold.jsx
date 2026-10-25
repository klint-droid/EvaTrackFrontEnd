import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import RegistrySearch from "../components/verifyHousehold/RegistrySearch";
import ManualEntry from "../components/verifyHousehold/ManualEntry";
import QrScannerModal from "../components/verifyHousehold/QrScannerModal";
import AdmissionModal from "../components/verifyHousehold/AdmissionModal";
import { useVerifyHousehold } from "../hooks/useVerifyHousehold";
import { TableLayout } from "../components/ui/TableLayout";
import { TableTabs } from "../components/ui/TableTabs";

export default function VerifyHousehold() {
  const {
    tab, setTab,
    query, setQuery,
    searchType, setSearchType,
    results,
    headName, setHeadName,
    householdName, setHouseholdName,
    walkInMembers,
    addWalkInMember, removeWalkInMember, updateWalkInMember,
    lookups,
    contactNumber, setContactNumber,
    message,
    loading,
    centers,
    activeCenterId,
    setActiveCenterId,
    assignmentModal,
    qrModalOpen, setQrModalOpen,
    scannedData,
    memberCount, setMemberCount,
    selectedMembers, setSelectedMembers,
    modalError,
    units,
    selectedUnitId, setSelectedUnitId,
    records,
    handleScan,
    handleSearch,
    handleVerify,
    handleCreate,
    handleConfirmAdmission,
    closeAdmissionModal,
    getHeadName,
    calculateAge,
    getActiveEvacuation,
  } = useVerifyHousehold();

  const tabs = (
    <TableTabs
      tabs={[
        { key: "admit", label: "Registry Admission (Search & QR)" },
        { key: "manual", label: "On-Site Walk-In Registration" },
      ]}
      activeTab={tab}
      onChange={setTab}
    />
  );

  return (
    <div className="w-full space-y-4 font-sans text-left animate-in fade-in duration-200">
      {/* Feedback Toast */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border animate-in zoom-in-95 duration-200 ${
            message.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-300"
              : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-900/60 dark:text-emerald-300"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span className="text-xs font-bold uppercase tracking-wide">
            {message.text}
          </span>
        </div>
      )}

      {/* Main Screen Layout matching other pages */}
      <TableLayout
        title="Household Verification"
        badgeText="SafeTrack Integrated"
        subtitle="Search demographic registry, verify arriving households by QR pass, or register on-site walk-ins"
        tabs={tabs}
      >
        {tab === "admit" && (
          <RegistrySearch
            query={query}
            setQuery={setQuery}
            searchType={searchType}
            setSearchType={setSearchType}
            handleSearch={handleSearch}
            setQrModalOpen={setQrModalOpen}
            loading={loading}
            results={results}
            records={records}
            getHeadName={getHeadName}
            handleVerify={handleVerify}
          />
        )}

        {tab === "manual" && (
          <ManualEntry
            headName={headName}
            setHeadName={setHeadName}
            householdName={householdName}
            setHouseholdName={setHouseholdName}
            contactNumber={contactNumber}
            setContactNumber={setContactNumber}
            walkInMembers={walkInMembers}
            addWalkInMember={addWalkInMember}
            removeWalkInMember={removeWalkInMember}
            updateWalkInMember={updateWalkInMember}
            lookups={lookups}
            calculateAge={calculateAge}
            handleCreate={handleCreate}
            loading={loading}
          />
        )}
      </TableLayout>

      <QrScannerModal
        qrModalOpen={qrModalOpen}
        setQrModalOpen={setQrModalOpen}
        handleScan={handleScan}
        setTab={setTab}
      />

      <AdmissionModal
        assignmentModal={assignmentModal}
        closeAdmissionModal={closeAdmissionModal}
        modalError={modalError}
        scannedData={scannedData}
        getActiveEvacuation={getActiveEvacuation}
        selectedMembers={selectedMembers}
        setSelectedMembers={setSelectedMembers}
        calculateAge={calculateAge}
        memberCount={memberCount}
        setMemberCount={setMemberCount}
        selectedUnitId={selectedUnitId}
        setSelectedUnitId={setSelectedUnitId}
        units={units}
        loading={loading}
        handleConfirmAdmission={handleConfirmAdmission}
        centers={centers}
        activeCenterId={activeCenterId}
        setActiveCenterId={setActiveCenterId}
      />
    </div>
  );
}