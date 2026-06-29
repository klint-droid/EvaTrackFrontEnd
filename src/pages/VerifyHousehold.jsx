import { QrCode, AlertCircle, CheckCircle2 } from "lucide-react";
import VerifyHouseholdTabs from "../components/verifyHousehold/VerifyHouseholdTabs";
import RegistrySearch from "../components/verifyHousehold/RegistrySearch";
import ManualEntry from "../components/verifyHousehold/ManualEntry";
import QrScannerModal from "../components/verifyHousehold/QrScannerModal";
import AdmissionModal from "../components/verifyHousehold/AdmissionModal";
import { useVerifyHousehold } from "../hooks/useVerifyHousehold";

export default function VerifyHousehold() {
  const {
    tab, setTab,
    query, setQuery,
    results,
    headName, setHeadName,
    contactNumber, setContactNumber,
    message,
    loading,
    user,
    centerName,
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      {/* Header matching Disaster Events style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-950 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Household Verification
            </h1>
            {user && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 font-semibold rounded-md text-xs border border-amber-100 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Station: {centerName ?? "---"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border animate-in zoom-in-95 duration-300 ${
            message.type === "error"
              ? "bg-red-50 border-red-100 text-red-700"
              : "bg-emerald-50 border-emerald-100 text-emerald-700"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          <span className="text-xs font-black uppercase tracking-wide">
            {message.text}
          </span>
        </div>
      )}

      {/* Main Screen Wrapper: Card with tabs inside */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[380px] flex flex-col relative">
        <VerifyHouseholdTabs tab={tab} setTab={setTab} />

        {tab === "admit" && (
          <RegistrySearch
            query={query}
            setQuery={setQuery}
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
            contactNumber={contactNumber}
            setContactNumber={setContactNumber}
            memberCount={memberCount}
            setMemberCount={setMemberCount}
            handleCreate={handleCreate}
            loading={loading}
          />
        )}
      </div>

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
      />
    </div>
  );
}