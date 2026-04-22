import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, Building2, Users, Save, Navigation, Loader2 } from "lucide-react";
import LocationPicker from "../Location/LocationPicker";
import { reverseGeocode } from "../../utils/reverseGeocode";

export default function CenterModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({ name: "", capacity: "" });
  const [position, setPosition] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        capacity: initialData.capacity || "",
      });
      if (initialData.latitude && initialData.longitude) {
        const pos = { lat: initialData.latitude, lng: initialData.longitude };
        setPosition(pos);
        setLat(pos.lat);
        setLng(pos.lng);
        reverseGeocode(pos.lat, pos.lng).then(setAddress);
      }
    } else {
      setForm({ name: "", capacity: "" });
      setPosition(null); setLat(null); setLng(null); setAddress(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSelectLocation = async (pos) => {
    setPosition(pos);
    setLat(pos.lat);
    setLng(pos.lng);
    setLoadingAddress(true);
    try {
      const addr = await reverseGeocode(pos.lat, pos.lng);
      setAddress(addr);
    } finally { setLoadingAddress(false); }
  };
  const handleSubmit = () => {
    if (!address?.full_address) {
      alert("Please select a valid location");
      return;
    }

    onSubmit({
      name: form.name,
      capacity: Number(form.capacity),
      latitude: lat,
      longitude: lng,
      region: address?.region,
      province: address?.province,
      city: address?.city,
      barangay: address?.barangay,
      street: address?.street,
      full_address: address?.full_address,
    });
  };

  const isFormValid = form.name && form.capacity && lat && lng && address;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      {/* 🌑 DARKENED OVERLAY */}
      <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={onClose} />

      {/* 📦 MODAL CARD */}
      <div className="relative bg-white rounded-[2rem] w-full max-w-6xl h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* ⚡️ HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="font-black text-slate-800 tracking-tight">
                {initialData ? "Modify Station" : "Register New Station"}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                Asset Allocation Control
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* 🔥 MAIN SPLIT VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">

          {/* LEFT: DATA ENTRY */}
          <div className="lg:col-span-4 p-8 space-y-8 overflow-y-auto bg-white border-r border-slate-100">
            
            {/* INPUTS */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Station Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="e.g. City Central High"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Maximum Capacity</label>
                <div className="relative group">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* GEO-RECAP SECTION */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Geographic Metadata</label>
              
              <div className={`p-5 rounded-2xl border transition-all ${address ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                {loadingAddress ? (
                  <div className="flex items-center gap-3 text-blue-600 font-bold text-xs py-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Synchronizing coordinates...</span>
                  </div>
                ) : address ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Navigation size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-blue-900 leading-snug">{address.full_address}</p>
                    </div>
                    <div className="flex gap-4 pt-2 border-t border-blue-200/50">
                      <div>
                        <p className="text-[8px] font-black text-blue-400 uppercase">Latitude</p>
                        <p className="text-xs font-mono font-bold text-blue-700">{lat?.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-blue-400 uppercase">Longitude</p>
                        <p className="text-xs font-mono font-bold text-blue-700">{lng?.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4 text-slate-400 space-y-2">
                    <MapPin size={24} className="opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-tighter">Pin location on the map to continue</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: TACTICAL MAP */}
          <div className="lg:col-span-8 h-full bg-slate-100">
            <LocationPicker
              position={position}
              onSelect={handleSelectLocation}
            />
          </div>
        </div>

        {/* ⚡️ FOOTER */}
        <div className="flex justify-end gap-4 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={onClose}
            className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest px-4 py-2 transition-colors"
          >
            Abort
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:shadow-none disabled:text-slate-400 transition-all"
          >
            <Save size={16} strokeWidth={3} />
            Commit Station
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}