import React from "react";
import { Users, Phone, MapPin, AlertCircle, Building, DoorOpen, CheckCircle, XCircle } from "lucide-react";

export default function HouseholdStats({ household, isEvacuated, isScattered, allActiveEvacuations, primaryEvacuation, allEvacuatedMemberIds }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Basic Information
                </p>
                {[
                    { icon: <Users size={16} className="text-blue-600" />,  label: 'Members', value: `${household.member_count || household.members?.length || 0} people` },
                    { icon: <Phone size={16} className="text-blue-600" />,  label: 'Contact', value: household.contact_number || '—' },
                    { icon: <MapPin size={16} className="text-blue-600" />, label: 'Address', value: household.address?.full_address || '—' },
                ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            {icon}
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{label}</p>
                            <p className="text-sm font-bold text-slate-800">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Evacuation Status */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Evacuation Status
                </p>
                {isEvacuated ? (
                    <>
                        {isScattered ? (
                            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
                                <AlertCircle className="w-5 h-5 mt-0.5 text-amber-600 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold">Family Separated Across {allActiveEvacuations.length} Centers</p>
                                    <p className="text-[10px] mt-0.5 text-amber-700">
                                        {allActiveEvacuations.map(e => e.center?.name || 'Unknown').join(', ')}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                        {[
                            { icon: <Building size={16} className="text-green-600" />,     label: 'Center',           value: isScattered ? `${allActiveEvacuations.length} centers` : (primaryEvacuation?.center?.name || '—') },
                            { icon: <DoorOpen size={16} className="text-green-600" />,     label: 'Unit',             value: primaryEvacuation?.unit_allocation?.unit?.name || primaryEvacuation?.unitAllocation?.unit?.name || 'No unit assigned' },
                            { icon: <CheckCircle size={16} className="text-green-600" />,  label: 'Event',            value: primaryEvacuation?.event?.name || '—' },
                            { icon: <Users size={16} className="text-green-600" />,        label: 'Verified Members', value: `${allEvacuatedMemberIds.size} of ${household.members?.length || 0} verified` },
                        ].map(({ icon, label, value }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    {icon}
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{label}</p>
                                    <p className="text-sm font-bold text-slate-800">{value}</p>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                        <XCircle size={40} className="mb-2" />
                        <p className="text-sm font-bold">Not currently evacuated</p>
                    </div>
                )}
            </div>
        </div>
    );
}
