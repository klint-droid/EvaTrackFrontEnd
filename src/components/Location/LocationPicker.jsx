import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import { Search, Map as MapIcon, Loader2 } from "lucide-react";
import L from "leaflet";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function MapEvents({ onSelect }) {
  useMapEvents({
    click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16, { animate: true });
  }, [position, map]);
  return null;
}

export default function LocationPicker({ position, onSelect }) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const defaultCenter = [14.5995, 120.9842]; 

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${search}`);
      const data = await res.json();
      if (data.length > 0) {
        onSelect({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else { alert("Location not found"); }
    } catch (err) { console.error(err); } 
    finally { setSearching(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* 🔍 FLOATING SEARCH BAR */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search address or landmark..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
        >
          {searching ? <Loader2 size={18} className="animate-spin" /> : <MapIcon size={18} />}
        </button>
      </div>

      {/* 🗺 MAP CONTAINER */}
      <div className="flex-1 overflow-hidden border-l border-slate-200">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          zoomControl={false} // Clean UI
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Recenter position={position} />
          <MapEvents onSelect={onSelect} />
          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  onSelect({ lat, lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}