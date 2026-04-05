import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { getCenters } from "../api/evacuation/getCenters";
import { getCapacity } from "../api/evacuation/getCapacity";

import CapacityChart from "../components/dashboard/CapacityChart";

const Dashboard = () => {
  const [centers, setCenters] = useState([]);
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
      const centerList = res.data;

      setCenters(centerList);

      const capacities = await Promise.all(
        centerList.map(async (c) => {
          const cap = await getCapacity(c.id);

          return {
            name: c.name,
            current: cap.data.current,
            max: cap.data.max,
          };
        })
      );

      setChartData(capacities);

      // Compute stats
      const totalCenters = centerList.length;
      const totalCapacity = capacities.reduce((sum, c) => sum + c.max, 0);
      const totalOccupied = capacities.reduce((sum, c) => sum + c.current, 0);

      setStats({
        totalCenters,
        totalCapacity,
        totalOccupied,
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
      <div className="space-y-6">

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
              {stats.totalCapacity - stats.totalOccupied}
            </h2>
          </div>

        </div>

        {/* 🔹 CHART */}
        <CapacityChart data={chartData} />

        {/* 🔹 TABLE PREVIEW (OPTIONAL BUT POWERFUL) */}
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
                const percent = (c.current / c.max) * 100;

                return (
                  <tr key={index} className="border-b">
                    <td className="p-2">{c.name}</td>
                    <td>{c.current}</td>
                    <td>{c.max}</td>

                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          percent >= 90
                            ? "bg-red-100 text-red-600"
                            : percent >= 60
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {percent >= 90
                          ? "Critical"
                          : percent >= 60
                          ? "Warning"
                          : "Safe"}
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