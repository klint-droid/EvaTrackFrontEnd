import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X, MapPin, Building2, Users, Save,
  Navigation, Loader2, Search, Check
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


  const handleSelectLocation = async (pos) => {
    setPosition(pos); setLat(pos.lat); setLng(pos.lng);
    setLoadingAddr(true);
    try {
      const addr = await reverseGeocode(pos.lat, pos.lng);
      if(addr){
        setOsmAddress(addr);
        setSearchQuery(addr.full_address);
        setSearchResults([]);
      } else {
        setOsmAddress(null);
        setSearchQuery("");
      }
    } catch (error) {
      console.error(error);
      setOsmAddress(null);
      setSearchQuery("");
    }
    finally { setLoadingAddr(false); }
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
      } catch { setSearchResults([]); }
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
      await reverseGeocode(pos.lat, pos.lng);
      setOsmAddress({ full_address: result.display_name });
    } catch (error) {
      console.error(error);
      setOsmAddress(null);
    }
    finally { setLoadingAddr(false); }
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
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9990] p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm fixed transition-opacity duration-300 animate-in fade-in" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-100 my-auto transform scale-100 transition-all duration-300 animate-in zoom-in-95 flex flex-col max-h-[90vh] h-[800px]">
        
        {/* Header - Matches UserManagement */}
        <div className="px-8 py-6 border-b border-slate-200/60 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Update Evacuation Center" : "Register New Center"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Specify the facility details and pinpoint its exact location on the map.
          </p>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <X size={20}/>
          </button>
        </div>

        {/* Body - Two Column Layout */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* Left Column: MAP */}
          <div className="w-full lg:w-7/12 h-[350px] lg:h-full bg-slate-100 relative">
            <LocationPicker position={position} onSelect={handleSelectLocation} />
            
            {/* Overlay instruction */}
            {!osmAddress && !loadingAddr && (
               <div className="absolute top-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-lg rounded-2xl flex items-center gap-3 z-[1000] animate-in fade-in slide-in-from-top-4">
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                   <MapPin size={20} />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-800">Pin the location</p>
                   <p className="text-xs font-medium text-slate-500">Click anywhere on the map to set the exact coordinates for the center.</p>
                 </div>
               </div>
            )}
          </div>

          {/* Right Column: INPUTS */}
          <div className="w-full lg:w-5/12 p-8 overflow-y-auto flex flex-col space-y-8 bg-white border-l border-slate-100">
            
            {/* Facility Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Facility Details</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Center Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. City Central High"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Maximum Capacity</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. 500"
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4 flex-1">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Location Setup</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Search Address</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={searchQuery}
                    onChange={handleSearchInput}
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="Type an address or landmark..."
                  />
                  {searchLoading && (
                    <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />
                  )}

                  {searchResults.length > 0 && (
                    <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                      {searchResults.map((r) => (
                        <button
                          key={r.place_id}
                          onClick={() => handleSelectResult(r)}
                          className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <span className="font-semibold block truncate">{r.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Search or click anywhere on the map to pin.</p>
              </div>

              {/* Address Recap Box */}
              {(osmAddress || loadingAddr) && (
                <div className={`p-4 rounded-xl border transition-all ${osmAddress ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100"}`}>
                  {loadingAddr ? (
                    <div className="flex items-center gap-3 text-blue-600 font-bold text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Resolving address...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 items-start justify-between">
                      <div className="flex items-start gap-2 w-full">
                        <Navigation size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold text-blue-900 leading-snug">{osmAddress.full_address}</p>
                      </div>
                      <div className="flex gap-4 shrink-0 border-t border-blue-200/50 pt-3 w-full">
                        <div>
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Latitude</p>
                          <p className="text-xs font-mono font-bold text-blue-800">{lat?.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Longitude</p>
                          <p className="text-xs font-mono font-bold text-blue-800">{lng?.toFixed(6)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Matches UserManagement */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:bg-slate-300 disabled:shadow-none disabled:active:scale-100 px-6 py-3"
          >
            {isEdit ? <Check size={16} /> : <Save size={16} />}
            {isEdit ? "Save Changes" : "Register Station"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}