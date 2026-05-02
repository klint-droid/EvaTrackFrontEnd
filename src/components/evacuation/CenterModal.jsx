import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X, MapPin, Building2, Users, Save,
  Navigation, Loader2, Search
} from "lucide-react";
import LocationPicker from "../Location/LocationPicker";
import { reverseGeocode } from "../../utils/reverseGeocode";

export default function CenterModal({ isOpen, onClose, onSubmit, initialData }) {
  const isEdit = Boolean(initialData);

  const [form, setForm]               = useState({ name: "", capacity: "" });
  const [position, setPosition]       = useState(null);
  const [lat, setLat]                 = useState(null);
  const [lng, setLng]                 = useState(null);
  const [osmAddress, setOsmAddress]   = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(false);

  // address search
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounce                          = useRef(null);

  // ── reset / populate on open ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({ name: initialData.name || "", capacity: initialData.capacity || "" });

      if (initialData.latitude && initialData.longitude) {
        const pos = { lat: Number(initialData.latitude), lng: Number(initialData.longitude) };
        setPosition(pos); setLat(pos.lat); setLng(pos.lng);
      }

      const saved = initialData.osm_address || "";
      setOsmAddress(saved ? { full_address: saved } : null);
      setSearchQuery(saved);
    } else {
      setForm({ name: "", capacity: "" });
      setPosition(null); setLat(null); setLng(null);
      setOsmAddress(null); setSearchQuery(""); setSearchResults([]);
    }
  }, [initialData, isOpen]);

  // ── map pin ──────────────────────────────────────────────────────────────────
  const handleSelectLocation = async (pos) => {
    setPosition(pos); setLat(pos.lat); setLng(pos.lng);
    setLoadingAddr(true);
    try {
      const addr = await reverseGeocode(pos.lat, pos.lng);
      setOsmAddress(addr);
      setSearchQuery(addr.full_address || "");
      setSearchResults([]);
    } finally { setLoadingAddr(false); }
  };

  // ── manual search (Nominatim) ────────────────────────────────────────────────
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchResults([]);
    if (debounce.current) clearTimeout(debounce.current);
    if (!val.trim() || val.length < 3) return;

    debounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`,
          { headers: { "User-Agent": "EvacTrack/1.0 (klintruales11@gmail.com)" } }
        );
        setSearchResults(await res.json());
      } catch { /* silently fail */ }
      finally { setSearchLoading(false); }
    }, 500);
  };

  const handleSelectResult = async (result) => {
    const pos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setSearchResults([]);
    setSearchQuery(result.display_name);
    setPosition(pos); setLat(pos.lat); setLng(pos.lng);
    setLoadingAddr(true);
    try {
      const addr = await reverseGeocode(pos.lat, pos.lng);
      setOsmAddress(addr);
    } finally { setLoadingAddr(false); }
  };

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!lat || !lng || !osmAddress?.full_address) {
      alert("Please pin or search a location first.");
      return;
    }
    onSubmit({
      name:        form.name,
      capacity:    Number(form.capacity),
      latitude:    lat,
      longitude:   lng,
      osm_address: osmAddress.full_address,
    });
  };

  const isFormValid = form.name && form.capacity && lat && lng && osmAddress?.full_address;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative bg-white rounded-[2rem] w-full max-w-6xl h-[88vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Building2 size={20} /></div>
            <div>
              <h2 className="font-black text-slate-800 tracking-tight">
                {isEdit ? "Modify Station" : "Register New Station"}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                Pin on map or search an address
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">

          {/* LEFT */}
          <div className="lg:col-span-4 flex flex-col overflow-y-auto bg-white border-r border-slate-100">
            <div className="p-6 space-y-5">

              {/* Station name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Station Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. City Central High"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Maximum Capacity</label>
                <div className="relative group">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Address search */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Search Address</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 text-slate-300" size={15} />
                  <input
                    value={searchQuery}
                    onChange={handleSearchInput}
                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="Type address or landmark…"
                  />
                  {searchLoading && (
                    <Loader2 size={14} className="absolute right-3.5 top-3.5 text-blue-400 animate-spin" />
                  )}

                  {searchResults.length > 0 && (
                    <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                      {searchResults.map((r) => (
                        <button
                          key={r.place_id}
                          onClick={() => handleSelectResult(r)}
                          className="w-full text-left px-4 py-3 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <span className="font-semibold block truncate">{r.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 px-1">Or pin directly on the map →</p>
              </div>

              {/* Address recap */}
              {(osmAddress || loadingAddr) && (
                <div className={`p-4 rounded-2xl border transition-all ${osmAddress ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100"}`}>
                  {loadingAddr ? (
                    <div className="flex items-center gap-3 text-blue-600 font-bold text-xs">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Fetching address…</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Navigation size={13} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-blue-900 leading-snug">{osmAddress.full_address}</p>
                      </div>
                      <div className="flex gap-4 pt-2 border-t border-blue-100">
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
                  )}
                </div>
              )}

              {/* Empty state */}
              {!osmAddress && !loadingAddr && (
                <div className="flex flex-col items-center py-8 text-slate-300 space-y-2">
                  <MapPin size={28} className="opacity-40" />
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-center text-slate-400">
                    Search above or pin the map
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: MAP */}
          <div className="lg:col-span-8 h-full bg-slate-100">
            <LocationPicker position={position} onSelect={handleSelectLocation} />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest px-4 py-2 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:shadow-none disabled:text-slate-400 transition-all"
          >
            <Save size={16} strokeWidth={3} />
            {isEdit ? "Save Changes" : "Register Station"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}