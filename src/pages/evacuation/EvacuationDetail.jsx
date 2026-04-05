import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCenter } from "../../api/evacuation/getCenter";
import { getCapacity } from "../../api/evacuation/getCapacity";

import StatCard from "../../components/dashboard/StatCard";
import CapacityChart from "../../components/dashboard/CapacityChart";

export default function EvacuationDetail() {
  const { id } = useParams();

  const [center, setCenter] = useState(null);
  const [capacity, setCapacity] = useState(null);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await getCenter(id);
      const cap = await getCapacity(id);

      setCenter(res.data);
      setCapacity(cap.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!center) return <p className="p-6">Loading...</p>;

  const current = capacity?.current ?? 0;
  const max = capacity?.max ?? center.capacity ?? 0;
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

    </div>
  );
}