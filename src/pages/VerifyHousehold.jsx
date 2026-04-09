import { useState, useEffect } from "react";
import QRScanner from "../components/QRScanner";
import API from "../api";
// Optional: If you use lucide-react or similar for icons
// import { Camera, Keyboard, CheckCircle, AlertCircle, Users, Home } from "lucide-react";

const VerifyHousehold = () => {
  const [input, setInput] = useState("");
  const [household, setHousehold] = useState(null);
  const [evacuation, setEvacuation] = useState(null);
  
  const [useScanner, setUseScanner] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");

  // UX States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await API.get("/api/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    }
  };

  const handleScan = (data) => {
    setInput(data);
    handleVerify(data, true);
  };

  // Combined verify function to handle both manual and auto
  const handleVerify = async (householdId = input, isAuto = false) => {
    if (!householdId.trim()) {
      setError("Please enter a Household ID.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setHousehold(null);

    try {
      const res = await API.post("/api/households/verify-household", {
        household_id: householdId.trim(),
      });

      setHousehold(res.data.data.household);
      setEvacuation(res.data.data.record);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please check the ID.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedRoom) {
      setError("Please select a room first.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await API.post(`/api/rooms/${selectedRoom}/assign`, {
        household_id: household.household_id,
      });

      setSuccess("✅ Household assigned successfully!");
      fetchRooms(); // Refresh capacities
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Verify Household</h2>
          <p className="text-sm text-gray-500 mt-1">Scan QR code or enter ID manually to assign a room.</p>
        </div>

        {/* Input Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setUseScanner(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              useScanner ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📷 Scan QR
          </button>
          <button
            onClick={() => setUseScanner(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              !useScanner ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ⌨️ Manual Entry
          </button>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          {useScanner ? (
            <div className="bg-black rounded-lg overflow-hidden border-2 border-gray-200 aspect-video flex items-center justify-center relative">
               {/* Assuming QRScanner has its own UI, we wrap it cleanly */}
              <QRScanner onScan={handleScan} />
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. HH-12345"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <button
                onClick={() => handleVerify()}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {error && <div className="p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
        {success && <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">{success}</div>}

        {/* Results & Assignment Section */}
        {household && (
          <div className="border-t border-gray-100 pt-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Household Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Household ID</span>
                <span className="font-medium text-gray-900">{household.household_id}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Representative Name</span>
                <span className="font-medium text-gray-900">{household.household_name}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</span>
                <span className="font-medium text-gray-900">{household.phone_number || "N/A"}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
                {evacuation?.is_verified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Not Verified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Assign to Evacuation Room</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="" disabled>-- Select an available room --</option>
                {rooms.map((room) => {
                  const isFull = room.current_occupancy >= room.max_capacity;
                  return (
                    <option key={room.id} value={room.id} disabled={isFull}>
                      Room {room.room_number} • Occupancy: {room.current_occupancy}/{room.max_capacity} {isFull ? "(FULL)" : ""}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={handleAssign}
                disabled={!evacuation?.is_verified || !selectedRoom || isLoading}
                className={`w-full py-3.5 rounded-lg font-medium text-white transition-all ${
                  !evacuation?.is_verified || !selectedRoom || isLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? "Assigning..." : "Confirm Room Assignment"}
              </button>
              
              {!evacuation?.is_verified && (
                <p className="text-xs text-center text-red-500 mt-2">
                  Household must be verified before room assignment.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyHousehold;