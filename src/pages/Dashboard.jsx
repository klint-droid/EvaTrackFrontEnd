import React, { useEffect, useState } from "react";
import { getCenters } from "../api/evacuation/getCenters";
import { getCapacity } from "../api/evacuation/getCapacity";
import CapacityChart from "../components/dashboard/CapacityChart";

const Dashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalCenters: 0,
    totalCapacity: 0,
    totalOccupied: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getCenters();
      const centerList = res.data || [];

      // 🔥 Fetch capacity safely
      const capacities = await Promise.all(
        centerList.map(async (c) => {
          try {
            const id = c.evacuation_center_id;

            if (!id) {
              console.warn("Missing ID:", c);
              return {
                name: c.name,
                current: 0,
                max: c.capacity || 0,
              };
            }

            const cap = await getCapacity(id);

            return {
              name: c.name,
              current: cap.data?.current ?? 0,
              max: cap.data?.max ?? c.capacity ?? 0,
            };
          } catch (err) {
            console.error("Capacity error:", err);
            return {
              name: c.name,
              current: 0,
              max: c.capacity || 0,
            };
          }
        })
      );

      setChartData(capacities);

      // 🔥 Compute stats safely
      const totalCenters = centerList.length;
      const totalCapacity = capacities.reduce(
        (sum, c) => sum + (c.max || 0),
        0
      );
      const totalOccupied = capacities.reduce(
        (sum, c) => sum + (c.current || 0),
        0
      );

      setStats({
        totalCenters,
        totalCapacity,
        totalOccupied,
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* 🔹 TOP CARDS */}
      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Centers</p>
          <h2 className="text-2xl font-bold text-blue-600">
            {stats.totalCenters}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Capacity</p>
          <h2 className="text-2xl font-bold text-green-600">
            {stats.totalCapacity}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Occupied</p>
          <h2 className="text-2xl font-bold text-yellow-600">
            {stats.totalOccupied}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Available Slots</p>
          <h2 className="text-2xl font-bold text-red-600">
            {Math.max(stats.totalCapacity - stats.totalOccupied, 0)}
          </h2>
        </div>

      </div>

      {/* 🔹 CHART */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Capacity Overview</h3>
        <CapacityChart data={chartData} />
      </div>

      {/* 🔹 TABLE PREVIEW */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Evacuation Centers Overview</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Center</th>
              <th>Occupied</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {chartData.map((c, index) => {
              const percent = c.max
                ? (c.current / c.max) * 100
                : 0;

              const status =
                percent >= 90
                  ? "Critical"
                  : percent >= 60
                  ? "Warning"
                  : "Safe";

              return (
                <tr key={index} className="border-b">
                  <td className="p-2">{c.name}</td>
                  <td>{c.current}</td>
                  <td>{c.max}</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        status === "Critical"
                          ? "bg-red-100 text-red-600"
                          : status === "Warning"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;