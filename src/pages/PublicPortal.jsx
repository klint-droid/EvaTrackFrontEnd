import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
// Leaflet CSS is already imported in your App.jsx, which is great!

// Fix for default Leaflet marker icons not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// 🛑 PLACEHOLDER DATA (Now with coordinates)
const MOCK_CENTERS = [
  { 
    id: 1, 
    name: "Cebu City Sports Center", 
    address: "Osmeña Blvd, Cebu City", 
    lat: 10.306, 
    lng: 123.892,
    capacity: 500, 
    occupied: 120, 
    services: ["Medical", "Kitchen", "Pet Friendly"] 
  },
  { 
    id: 2, 
    name: "Barangay Mambaling Gym", 
    address: "Mambaling, Cebu City", 
    lat: 10.289, 
    lng: 123.881,
    capacity: 200, 
    occupied: 185, 
    services: ["Kitchen", "Water Station"] 
  },
  { 
    id: 3, 
    name: "Guadalupe Elementary School", 
    address: "Guadalupe, Cebu City", 
    lat: 10.325, 
    lng: 123.886,
    capacity: 350, 
    occupied: 350, 
    services: ["Medical", "Child Care"] 
  }
];

// 🗺️ Helper component to animate the map to the selected center
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const PublicPortal = () => {
  const [centers, setCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Default map center (Cebu City general coordinates)
  const defaultCenter = [10.3157, 123.8854];

  // 🔌 API INTEGRATION
  useEffect(() => {
    const fetchPublicCenters = async () => {
      setIsLoading(true);
      try {
        // const res = await API.get("/api/public/centers");
        // setCenters(res.data);
        
        setTimeout(() => {
          setCenters(MOCK_CENTERS);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error("Failed to fetch centers", err);
        setIsLoading(false);
      }
    };

    fetchPublicCenters();
  }, []);

  const filteredCenters = centers.filter(center => 
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCapacityStatus = (occupied, capacity) => {
    const percentage = (occupied / capacity) * 100;
    if (percentage >= 100) return { text: "FULL", color: "bg-red-500", textCol: "text-red-700" };
    if (percentage >= 85) return { text: "NEAR CAPACITY", color: "bg-yellow-500", textCol: "text-yellow-700" };
    return { text: "AVAILABLE", color: "bg-green-500", textCol: "text-green-700" };
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50">
      
      {/* 🔍 Search Section */}
      <section className="bg-blue-900 py-8 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Find the Nearest Open Evacuation Center
          </h2>
          <div className="relative max-w-2xl mx-auto">
            <input 
              type="text" 
              placeholder="Search by barangay, school, or center name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl shadow-lg text-lg outline-none focus:ring-4 focus:ring-blue-500/50 border-0 transition-all"
            />
          </div>
        </div>
      </section>

      {/* 🗺️ Main Layout: List + Map */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Center List */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-[600px] overflow-y-auto pr-2 pb-4">
          <div className="flex justify-between items-center mb-2 sticky top-0 bg-gray-50 z-10 py-2">
            <h3 className="font-semibold text-gray-700">Centers ({filteredCenters.length})</h3>
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
            filteredCenters.map(center => {
              const status = getCapacityStatus(center.occupied, center.capacity);
              const percent = Math.min((center.occupied / center.capacity) * 100, 100);
              const isSelected = selectedCenter?.id === center.id;

              return (
                <div 
                  key={center.id} 
                  onClick={() => setSelectedCenter(center)}
                  className={`bg-white rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md transform scale-[1.02]' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{center.name}</h4>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                    <span>📍</span> {center.address}
                  </p>
                  
                  {/* Capacity Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-bold tracking-wide">
                      <span className={status.textCol}>{status.text}</span>
                      <span className="text-gray-600">{center.occupied} / {center.capacity}</span>
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
                    {center.services.map(service => (
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
            
            {/* Component to handle map panning */}
            <MapUpdater center={selectedCenter} />

            {/* Render markers for all filtered centers */}
            {filteredCenters.map(center => {
              const status = getCapacityStatus(center.occupied, center.capacity);
              return (
                <Marker 
                  key={center.id} 
                  position={[center.lat, center.lng]}
                  eventHandlers={{
                    click: () => setSelectedCenter(center),
                  }}
                >
                  <Popup>
                    <div className="text-center p-1">
                      <strong className="block text-gray-900 mb-1">{center.name}</strong>
                      <span className={`text-xs font-bold ${status.textCol}`}>
                        {status.text} ({center.occupied}/{center.capacity})
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

      </main>
    </div>
  );
};

export default PublicPortal;