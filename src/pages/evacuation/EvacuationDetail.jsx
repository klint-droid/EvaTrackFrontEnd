import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCapacity } from "../../api/evacuation/getCapacity";
import { getRoomsByCenter } from "../../api/rooms/getRoomsByCenter";
import RoomModal from "../../components/evacuation/RoomModal";
import StatCard from "../../components/dashboard/StatCard";
import CapacityChart from "../../components/dashboard/CapacityChart";

export default function EvacuationDetail() {
  const { id } = useParams();

  const [center, setCenter] = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [hasRooms, setHasRooms] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await getRoomsByCenter(id);

      setCenter(res.data.center);
      setRooms(res.data.rooms);
      setHasRooms(res.data.has_rooms);

      const cap = await getCapacity(id);
      setCapacity(cap.data);

    } catch (err) {
      console.error(err);
    }
  };

  if (!center) return <p className="p-6">Loading...</p>;

  // ✅ FIXED BASED ON YOUR BACKEND RESPONSE
  const current = capacity?.current_occupancy ?? 0;
  const max = capacity?.capacity ?? center.capacity ?? 0;
  const available = max - current;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">{center.name}</h2>
        <p className="text-gray-600">{center.location}</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          title="Current Evacuees"
          value={current}
          color="blue"
        />

        <StatCard
          title="Capacity"
          value={max}
          color="green"
        />

        <StatCard
          title="Available Space"
          value={available}
          color="orange"
        />
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">
          Capacity Overview
        </h3>

        <CapacityChart
          current={current}
          max={max}
        />
      </div>

      {/* SIMPLE TEXT DISPLAY */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Capacity</h3>
        <p className="text-lg">
          {current} / {max}
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Rooms</h3>

        <button
          onClick={() => setShowModal(true)}
          disabled={!hasRooms}
          className={`px-4 py-2 rounded text-white ${
            hasRooms
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          + Add Room
        </button>
      </div>

      {/* 🔥 ROOMS SECTION */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Rooms</h3>

        {!hasRooms ? (
          <div className="text-center py-10 text-gray-400 font-medium">
            🚫 This evacuation center does not use rooms  
            <br />
            Evacuees stay in open area
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            🟡 No rooms created yet
          </div>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room) => {
              const isFull = room.current_occupancy >= room.max_capacity;

              return (
                <div
                  key={room.room_id}
                  className="p-4 border rounded-lg flex justify-between items-center hover:shadow transition"
                >
                  <div>
                    <h4 className="font-semibold text-lg">
                      {room.room_number}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {room.current_occupancy} / {room.max_capacity}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      isFull
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {isFull ? "Full" : "Available"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
        {showModal && (
          <RoomModal
            centerId={id}
            onClose={() => setShowModal(false)}
            onSuccess={loadData}
          />
        )}
    </div>
  );
}