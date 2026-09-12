import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronRight, Users, DoorOpen, MapPin, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Helper for status config
const getStatusConfig = (occupiedCount, capacityCount) => {
  const occupied = Number(occupiedCount) || 0;
  const capacity = Number(capacityCount) || 1;
  const percent = Math.min(Math.round((occupied / capacity) * 100), 100);

  if (percent >= 90) {
    return {
      statusKey: "full",
      label: "Full / Critical",
      colorHex: "#EF4444",
      bgClass: "bg-rose-500",
      ringClass: "ring-rose-400",
      percent,
    };
  }
  if (percent >= 70) {
    return {
      statusKey: "near",
      label: "Near Capacity",
      colorHex: "#F59E0B",
      bgClass: "bg-amber-500",
      ringClass: "ring-amber-400",
      percent,
    };
  }
  return {
    statusKey: "open",
    label: "Accepting",
    colorHex: "#10B981",
    bgClass: "bg-emerald-500",
    ringClass: "ring-emerald-400",
    percent,
  };
};

// Create custom pulsing Leaflet divIcon
const createCenterIcon = (statusConfig, isFocused = false, isAssigned = false) => {
  const size = isFocused ? 28 : 22;
  const anchor = size / 2;

  return L.divIcon({
    className: "bg-transparent border-none",
    html: `
      <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
        ${
          isFocused || isAssigned
            ? `<span class="absolute inline-flex h-full w-full rounded-full ${statusConfig.bgClass} opacity-60 animate-ping"></span>`
            : ""
        }
        <div class="relative flex items-center justify-center rounded-full shadow-lg text-white font-black text-[10px] transition-transform duration-200 ${
          statusConfig.bgClass
        } ${isFocused ? "scale-110 ring-4 ring-white dark:ring-slate-900" : "ring-2 ring-white dark:ring-slate-900"}"
          style="width: ${size}px; height: ${size}px;">
          ${isAssigned ? "★" : ""}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -anchor - 4],
  });
};

// Map controller to handle auto-bounding and flyTo focus
function MapSynchronizer({ centers, focusedCenterId, mapRef }) {
  const map = useMap();

  // Expose map instance to parent if ref provided
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  // Auto-fit bounds on initial load or centers change
  useEffect(() => {
    const valid = centers.filter((c) => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    if (valid.length === 0) return;

    if (valid.length === 1) {
      map.setView([parseFloat(valid[0].latitude), parseFloat(valid[0].longitude)], 15, {
        animate: true,
      });
      return;
    }

    const bounds = L.latLngBounds(
      valid.map((c) => [parseFloat(c.latitude), parseFloat(c.longitude)])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
  }, [centers, map]);

  // Smoothly fly to center when focused from the left panel
  useEffect(() => {
    if (!focusedCenterId) return;
    const target = centers.find((c) => String(c.evacuation_center_id) === String(focusedCenterId));
    if (!target) return;

    const lat = parseFloat(target.latitude);
    const lng = parseFloat(target.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      map.flyTo([lat, lng], 16, { duration: 0.8 });
    }
  }, [focusedCenterId, centers, map]);

  return null;
}

export default function EvacuationCenterMap({
  centers = [],
  focusedCenterId = null,
  assignedCenterId = null,
  onSelectCenter,
  className = "",
}) {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // Filter centers with valid coordinates
  const validCenters = useMemo(() => {
    return centers.filter((c) => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
  }, [centers]);

  // Default coordinate (Cebu City / Mambaling area fallback)
  const defaultCenter = useMemo(() => {
    if (validCenters.length > 0) {
      return [parseFloat(validCenters[0].latitude), parseFloat(validCenters[0].longitude)];
    }
    return [10.2915, 123.8778];
  }, [validCenters]);

  const handleResetBounds = () => {
    if (!mapRef.current || validCenters.length === 0) return;
    if (validCenters.length === 1) {
      mapRef.current.setView(
        [parseFloat(validCenters[0].latitude), parseFloat(validCenters[0].longitude)],
        15,
        { animate: true }
      );
      return;
    }
    const bounds = L.latLngBounds(
      validCenters.map((c) => [parseFloat(c.latitude), parseFloat(c.longitude)])
    );
    mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
  };

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm bg-slate-900 ${className}`}
    >
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapSynchronizer centers={centers} focusedCenterId={focusedCenterId} mapRef={mapRef} />

        {validCenters.map((c) => {
          const lat = parseFloat(c.latitude);
          const lng = parseFloat(c.longitude);
          const isFocused = String(c.evacuation_center_id) === String(focusedCenterId);
          const isAssigned =
            assignedCenterId && String(c.evacuation_center_id) === String(assignedCenterId);
          const status = getStatusConfig(c.current_occupancy, c.capacity);
          const current = Number(c.current_occupancy) || 0;
          const max = Number(c.capacity) || 0;

          return (
            <Marker
              key={c.evacuation_center_id}
              position={[lat, lng]}
              icon={createCenterIcon(status, isFocused, isAssigned)}
              eventHandlers={{
                click: () => onSelectCenter && onSelectCenter(c.evacuation_center_id),
              }}
            >
              <Tooltip direction="top" offset={[0, -14]} opacity={1}>
                <div className="text-left font-sans">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{c.name}</p>
                  <p className="text-[10px] text-slate-500">{status.label} ({status.percent}%)</p>
                </div>
              </Tooltip>

              <Popup className="custom-leaflet-popup">
                <div className="p-1 min-w-[200px] text-left font-sans space-y-2">
                  <div className="border-b border-slate-100 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {c.name}
                      </h4>
                      {isAssigned && (
                        <span className="px-1 py-0.2 text-[8px] font-black uppercase rounded bg-blue-100 text-blue-800">
                          My Station
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {c.osm_address || "No address specified"}
                    </p>
                  </div>

                  {/* Occupancy Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600">
                      <span>Occupancy ({status.percent}%)</span>
                      <span>
                        {current} / {max}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${status.bgClass}`}
                        style={{ width: `${status.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 pt-1">
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-blue-500" />
                      <span>{current} Evacuees</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DoorOpen size={12} className="text-indigo-500" />
                      <span>{c.household_count ?? 0} Families</span>
                    </div>
                  </div>

                  {/* Manage Button */}
                  <button
                    type="button"
                    onClick={() => navigate(`/evacuation-centers/${c.evacuation_center_id}`)}
                    className="w-full mt-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    Manage Station <ChevronRight size={13} />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Top Badge: Center Count & Recenter Button */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <MapPin size={13} className="text-blue-500" />
          <span>{validCenters.length} Pinned Shelters</span>
        </div>

        <button
          type="button"
          onClick={handleResetBounds}
          title="Reset Map View to Fit All Shelters"
          className="p-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white transition-colors cursor-pointer"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Floating Bottom Legend */}
      <div className="absolute bottom-4 right-4 z-[400] pointer-events-none">
        <div className="px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-md space-y-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Accepting (&lt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Near Capacity (70-89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Critical / Full (&ge;90%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
