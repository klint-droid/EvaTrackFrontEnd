import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import API from "../api";

// 🎨 Status-Colored Custom SVG Pins
const createStatusIcon = (colorHex) => {
  return L.divIcon({
    html: `
      <div style="display: flex; justify-content: center; align-items: center; width: 34px; height: 34px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${colorHex}" width="34px" height="34px" style="filter: drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.4));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: "custom-status-marker",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  });
};

const userLocationIcon = L.divIcon({
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
      <span style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #3B82F6; opacity: 0.4; transform: scale(1);" class="animate-ping"></span>
      <span style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #3B82F6; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.4);"></span>
    </div>
  `,
  className: "user-pulse-marker",
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// 📐 Haversine Formula for Distance Calculation (in km)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 🚗 OSRM Public API Client for Real Road Routing (Selecting shortest route alternative)
const fetchOSRMRoute = async (start, end, profile = "driving") => {
  try {
    const isWalking = profile === "walking";
    const serviceName = isWalking ? "routed-foot" : "routed-car";
    const osrmProfile = isWalking ? "foot" : "driving";
    
    const url = `https://routing.openstreetmap.de/${serviceName}/route/v1/${osrmProfile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=true`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        // Find the alternative route with the shortest distance in meters
        const shortestRoute = data.routes.reduce((shortest, current) => {
          const d1 = current.legs[0].distance;
          const d2 = shortest.legs[0].distance;
          return d1 < d2 ? current : shortest;
        }, data.routes[0]);

        // OSRM coordinates are returned as [lng, lat], map to Leaflet [lat, lng]
        const coords = shortestRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const distance = shortestRoute.legs[0].distance; // meters
        const duration = shortestRoute.legs[0].duration; // seconds
        return { coords, distance, duration };
      }
    } else {
      console.warn(`OSRM profile ${osrmProfile} request failed with status: ${res.status}. Falling back to straight path.`);
    }
  } catch (err) {
    console.error("OSRM Road Routing API failed. Falling back to straight vector.", err);
  }
  
  // Straight line vector fallback (guarantees we always return valid coordinates!)
  const straightDistance = getDistance(start.lat, start.lng, end.lat, end.lng) * 1000;
  // Slower walking speeds for foot fallback: assume 5km/h (1.38 m/s) walking vs 40km/h driving
  const speedKmh = profile === "walking" ? 5 : 40;
  const straightDuration = (straightDistance / 1000 / speedKmh) * 3600;

  return {
    coords: [[start.lat, start.lng], [end.lat, end.lng]],
    distance: straightDistance,
    duration: straightDuration,
  };
};

const formatDistance = (meters) => {
  if (meters === undefined || meters === null) return "";
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null) return "";
  const mins = Math.round(seconds / 60);
  if (mins < 1) return "less than a min";
  return `${mins} mins`;
};

// 🗺️ Dynamic Map Bounding Box Updater (frames the entire OSRM road path)
const MapUpdater = ({ primaryRoute, altRoute, userLocation, selectedCenter, alternativeCenter }) => {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (primaryRoute && primaryRoute.length > 0) {
      primaryRoute.forEach((pt) => points.push(pt));
    }
    if (altRoute && altRoute.length > 0) {
      altRoute.forEach((pt) => points.push(pt));
    }

    // Fallbacks if routes aren't loaded yet
    if (points.length === 0) {
      if (userLocation) points.push([userLocation.lat, userLocation.lng]);
      if (selectedCenter && selectedCenter.id) points.push([selectedCenter.lat, selectedCenter.lng]);
      if (alternativeCenter) points.push([alternativeCenter.lat, alternativeCenter.lng]);
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [60, 60], maxZoom: 15, animate: true, duration: 1.5 });
    } else if (points.length === 1) {
      map.flyTo(points[0], 15, { animate: true, duration: 1.5 });
    }
  }, [primaryRoute, altRoute, userLocation, selectedCenter, alternativeCenter, map]);
  return null;
};

const PublicPortal = () => {
  const [centers, setCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Geolocation & Routing States
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [alternativeCenter, setAlternativeCenter] = useState(null);
  const [travelMode, setTravelMode] = useState("driving"); // "driving" or "walking"

  // OSRM Real Road Routes & KPI Metrics
  const [primaryRoute, setPrimaryRoute] = useState([]);
  const [altRoute, setAltRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [altRouteInfo, setAltRouteInfo] = useState(null);

  // Default General Fallback Coordinates
  const defaultCenter = [10.3157, 123.8854];

  // 🔌 Fetch Centers from Public API
  const fetchPublicCenters = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/api/public/evacuation-centers");
      if (res.data && res.data.centers) {
        const transformed = res.data.centers.map((c) => ({
          id: c.evacuation_center_id,
          name: c.name,
          address: c.osm_address || "No address specified",
          lat: parseFloat(c.latitude) || 10.3157,
          lng: parseFloat(c.longitude) || 123.8854,
          capacity: parseInt(c.capacity) || 100,
          occupied: parseInt(c.current_occupancy) || 0,
          services: ["Food", "Water", "First Aid"],
        }));
        setCenters(transformed);
        
        if (transformed.length > 0) {
          setSelectedCenter(transformed[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch centers", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 📍 Request Geolocation Coordinates
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    // Geolocation requires HTTPS on non-localhost origins in modern browsers
    const isSecure = window.isSecureContext;
    if (!isSecure) {
      alert(
        "Location access requires a secure connection (HTTPS).\n\n" +
        "If you're on a local network, try accessing this page via:\n" +
        "• http://localhost:5173\n" +
        "• Or deploy with HTTPS enabled."
      );
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocating(false);

        // Auto-select the nearest available center for immediate routing
        if (centers.length > 0) {
          let nearestCenter = centers[0];
          let minDist = Infinity;
          centers.forEach((c) => {
            const dist = getDistance(coords.lat, coords.lng, c.lat, c.lng);
            if (dist < minDist) {
              minDist = dist;
              nearestCenter = c;
            }
          });
          setSelectedCenter(nearestCenter);
        }
      },
      (error) => {
        console.warn("Geolocation request denied/failed", error);
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location permission was denied.\n\n" +
              "Please allow location access in your browser settings and try again."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            alert(
              "Your location could not be determined.\n\n" +
              "Make sure your device's location services (GPS) are enabled."
            );
            break;
          case error.TIMEOUT:
            alert(
              "Location request timed out.\n\n" +
              "Please check your internet connection and try again."
            );
            break;
          default:
            alert("An unknown error occurred while fetching your location.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchPublicCenters();
    requestUserLocation(); // System asks user for location upon clicking find evacuation (mounting)
  }, []);

  const getCapacityStatus = (occupied, capacity) => {
    const percentage = (occupied / capacity) * 100;
    if (percentage >= 100) return { text: "FULL", color: "bg-red-500", textCol: "text-red-700", hex: "#EF4444" };
    if (percentage >= 85) return { text: "NEAR CAPACITY", color: "bg-yellow-500", textCol: "text-yellow-700", hex: "#F59E0B" };
    return { text: "AVAILABLE", color: "bg-green-500", textCol: "text-green-700", hex: "#10B981" };
  };

  // Determine capacity level and smart routing targets
  const isRealCenter = selectedCenter && selectedCenter.id;
  const statusInfo = isRealCenter ? getCapacityStatus(selectedCenter.occupied, selectedCenter.capacity) : null;
  const isOverloaded = statusInfo && (statusInfo.text === "FULL" || statusInfo.text === "NEAR CAPACITY");

  // Smart Re-Routing Engine
  useEffect(() => {
    if (isOverloaded && centers.length > 0) {
      const available = centers.filter((c) => {
        const status = getCapacityStatus(c.occupied, c.capacity);
        return status.text === "AVAILABLE" && c.id !== selectedCenter.id;
      });

      if (available.length > 0) {
        let chosenAlt = available[0];
        if (userLocation) {
          let minDistance = Infinity;
          available.forEach((c) => {
            const dist = getDistance(userLocation.lat, userLocation.lng, c.lat, c.lng);
            if (dist < minDistance) {
              minDistance = dist;
              chosenAlt = c;
            }
          });
        }
        setAlternativeCenter(chosenAlt);
      } else {
        setAlternativeCenter(null);
      }
    } else {
      setAlternativeCenter(null);
    }
  }, [selectedCenter, centers, userLocation, isOverloaded]);

  // Fetch OSRM / Mapbox Road Coordinate Sequences
  useEffect(() => {
    const updateRoadRoutes = async () => {
      if (!userLocation || !isRealCenter) {
        setPrimaryRoute([]);
        setAltRoute([]);
        setRouteInfo(null);
        setAltRouteInfo(null);
        return;
      }

      if (isOverloaded && alternativeCenter) {
        // Fetch road coordinates to overloaded/blocked center
        const pRoute = await fetchOSRMRoute(userLocation, selectedCenter, travelMode);
        setPrimaryRoute(pRoute.coords);
        setRouteInfo({ distance: pRoute.distance, duration: pRoute.duration });

        // Fetch road coordinates to recommended safe center
        const aRoute = await fetchOSRMRoute(userLocation, alternativeCenter, travelMode);
        setAltRoute(aRoute.coords);
        setAltRouteInfo({ distance: aRoute.distance, duration: aRoute.duration });
      } else {
        // Fetch road coordinates to standard direct center
        const pRoute = await fetchOSRMRoute(userLocation, selectedCenter, travelMode);
        setPrimaryRoute(pRoute.coords);
        setRouteInfo({ distance: pRoute.distance, duration: pRoute.duration });
        setAltRoute([]);
        setAltRouteInfo(null);
      }
    };

    updateRoadRoutes();
  }, [userLocation, selectedCenter, alternativeCenter, isOverloaded, isRealCenter, travelMode]);

  const filteredCenters = centers.filter((center) =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50">
      
      {/* 🔍 Search & Geolocation Request Section */}
      <section className="bg-[#0f1c2d] py-8 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Find the Nearest Open Evacuation Center
          </h2>
          <div className="relative max-w-2xl mx-auto flex gap-3">
            <input 
              type="text" 
              placeholder="Search by barangay, school, or center name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-6 py-4 rounded-xl shadow-lg text-lg outline-none focus:ring-4 focus:ring-blue-500/50 border-0 transition-all text-slate-900"
            />
            <button
              onClick={requestUserLocation}
              disabled={isLocating}
              className="px-5 py-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-sky-700 text-white font-bold shadow-lg transition flex items-center gap-2 whitespace-nowrap"
            >
              <span>{isLocating ? "Locating..." : "📍 Locate Me"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 🗺️ Main Layout: List + Leaflet Map */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        
        {/* Left Column: Center List */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-[600px] overflow-y-auto pr-2 pb-4">
          <div className="flex justify-between items-center mb-2 sticky top-0 bg-gray-50 z-10 py-2">
            <h3 className="font-semibold text-gray-700 text-left">Centers ({filteredCenters.length})</h3>
            <span className="flex items-center text-xs font-medium text-green-700 bg-green-100 border border-green-200 px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
              Live Status
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32 text-gray-500">
              <span className="animate-pulse">Loading centers...</span>
            </div>
          ) : filteredCenters.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-200 text-gray-500">
              No centers found matching your search.
            </div>
          ) : (
            filteredCenters.map((center) => {
              const status = getCapacityStatus(center.occupied, center.capacity);
              const percent = Math.min((center.occupied / center.capacity) * 100, 100);
              const isSelected = selectedCenter?.id === center.id;
              const isAlternative = alternativeCenter && alternativeCenter.id === center.id;

              return (
                <div 
                  key={center.id} 
                  onClick={() => setSelectedCenter(center)}
                  className={`bg-white rounded-xl border p-5 cursor-pointer text-left transition-all duration-200 relative overflow-hidden ${
                    isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md transform scale-[1.02]' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  {isAlternative && (
                    <div className="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-lg animate-pulse shadow-sm">
                      Recommended Route
                    </div>
                  )}

                  <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1 pr-16">{center.name}</h4>
                  <p className="text-sm text-gray-500 mb-4 flex items-start gap-1">
                    <span className="mt-0.5">📍</span> <span className="flex-1">{center.address}</span>
                  </p>
                  
                  {/* Capacity Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-bold tracking-wide">
                      <span className={status.textCol}>{status.text}</span>
                      <span className="text-gray-600">{center.occupied} / {center.capacity} ({Math.round(percent)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${status.color}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {center.services.map((service) => (
                      <span key={service} className="text-[10px] uppercase tracking-wider font-bold bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1 rounded-md">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: React-Leaflet Map Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 h-[600px] relative overflow-hidden z-0">
          
          {/* Smart Floating Re-Routing Notification Banner */}
          {isOverloaded && alternativeCenter && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-[92%] max-w-md bg-amber-50 border border-amber-300 shadow-xl rounded-xl p-4 flex items-start gap-3 transition-all duration-300">
              <span className="text-lg">⚠️</span>
              <div className="text-left">
                <h5 className="font-extrabold text-amber-800 text-sm leading-none">Shelter at Capacity! Re-Routing...</h5>
                <p className="text-[11px] text-amber-700 mt-2 leading-relaxed">
                  <strong>{selectedCenter.name}</strong> is currently full/near capacity. We have automatically mapped a safe path to the nearest available center: <strong className="text-emerald-700 font-extrabold">{alternativeCenter.name}</strong>.
                </p>
                {altRouteInfo && (
                  <div className="mt-2.5 flex gap-2">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded shadow-sm">
                      {travelMode === "walking" ? "🚶" : "🚗"} Safest Road Route: {formatDistance(altRouteInfo.distance)} ({formatDuration(altRouteInfo.duration)})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Standard Safe Path Indicator */}
          {!isOverloaded && isRealCenter && routeInfo && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-[92%] max-w-sm bg-blue-50 border border-blue-200 shadow-xl rounded-xl p-3 flex items-center justify-between gap-3 transition-all duration-300">
              <div className="flex items-center gap-2 text-left">
                <span className="text-lg">🗺️</span>
                <div>
                  <h6 className="font-bold text-blue-800 text-xs">Direct Safe Path Configured</h6>
                  <p className="text-[10px] text-blue-600 mt-0.5">Route following active roads to {selectedCenter.name}</p>
                </div>
              </div>
              <span className="text-xs bg-blue-600 text-white font-extrabold px-2.5 py-1 rounded shadow-sm whitespace-nowrap">
                {formatDistance(routeInfo.distance)} ({formatDuration(routeInfo.duration)})
              </span>
            </div>
          )}

          {/* 🚗🚶 Mode of Transport Floating Selector */}
          <div className="absolute top-4 right-4 z-[1000] bg-white border border-gray-200 rounded-xl shadow-lg p-1 flex gap-1">
            <button
              onClick={() => setTravelMode("driving")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                travelMode === "driving"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>🚗</span> <span>Drive</span>
            </button>
            <button
              onClick={() => setTravelMode("walking")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                travelMode === "walking"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>🚶</span> <span>Walk</span>
            </button>
          </div>

          <MapContainer 
            center={defaultCenter} 
            zoom={13} 
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Component to dynamically auto-bound active elements along OSRM street geometries */}
            <MapUpdater 
              primaryRoute={primaryRoute}
              altRoute={altRoute}
              selectedCenter={selectedCenter} 
              userLocation={userLocation} 
              alternativeCenter={alternativeCenter} 
            />

            {/* 🔵 Render Geolocation dot */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                <Popup>
                  <div className="text-center font-bold text-blue-600 text-xs">Your Current Location</div>
                </Popup>
              </Marker>
            )}

            {/* 🟢🟡🔴 Render Evacuation Center Pins in Different Colors */}
            {filteredCenters.map((center) => {
              const status = getCapacityStatus(center.occupied, center.capacity);
              
              return (
                <Marker 
                  key={center.id} 
                  position={[center.lat, center.lng]}
                  icon={createStatusIcon(status.hex)}
                  eventHandlers={{
                    click: () => setSelectedCenter(center),
                  }}
                >
                  <Popup>
                    <div className="text-center p-1 text-left">
                      <strong className="block text-gray-900 font-black text-sm mb-1">{center.name}</strong>
                      <span className="block text-[11px] text-gray-500 mb-2">📍 {center.address}</span>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black text-white ${status.color}`}>
                        {status.text} ({center.occupied}/{center.capacity})
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* 📈 Render Dynamic Google-style Road Network Routing Polylines */}
            {userLocation && isRealCenter && (
              <>
                {isOverloaded && alternativeCenter ? (
                  <>
                    {/* Dotted RED road route representing overloaded/blocked shelter */}
                    {primaryRoute.length > 0 && (
                      <Polyline 
                        positions={primaryRoute}
                        pathOptions={{ color: "#EF4444", weight: 4, dashArray: "8, 10", opacity: 0.7 }}
                      />
                    )}
                    {/* Solid GREEN road route representing safest recommended shelter path */}
                    {altRoute.length > 0 && (
                      <Polyline 
                        positions={altRoute}
                        pathOptions={{ color: "#10B981", weight: 6, opacity: 0.95 }}
                      />
                    )}
                  </>
                ) : (
                  /* Standard SOLID BLUE road route representing direct safe access along roads */
                  primaryRoute.length > 0 && (
                    <Polyline 
                      positions={primaryRoute}
                      pathOptions={{ color: "#3B82F6", weight: 6, opacity: 0.9 }}
                    />
                  )
                )}
              </>
            )}
          </MapContainer>
        </div>

      </main>
    </div>
  );
};

export default PublicPortal;