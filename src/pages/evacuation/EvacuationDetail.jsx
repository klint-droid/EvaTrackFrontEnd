// pages/evacuation/EvacuationDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCenter } from "../../api/evacuation/getCenter";
import { getCapacity } from "../../api/evacuation/getCapacity";

export default function EvacuationDetail() {
  const { id } = useParams();

  const [center, setCenter] = useState(null);
  const [capacity, setCapacity] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getCenter(id);
    const cap = await getCapacity(id);

    setCenter(res.data);
    setCapacity(cap.data);
  };

  if (!center) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">{center.name}</h2>
      <p className="text-gray-600">{center.location}</p>

      <div className="mt-4 bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Capacity</h3>
        <p>
          {capacity?.current} / {capacity?.max}
        </p>
      </div>
    </div>
  );
}