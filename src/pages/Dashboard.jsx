import React from "react";
import DashboardLayout from "../layout/DashboardLayout";

const Dashboard = () => {
    return(
        <DashboardLayout>
            <div className="grid grid-cols-4 gap-6">

                <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">Total Households</p>
                <h2 className="text-2xl font-bold text-blue-600">1,240</h2>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">Evacuated</p>
                <h2 className="text-2xl font-bold text-green-600">842</h2>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">Not Evacuated</p>
                <h2 className="text-2xl font-bold text-red-600">398</h2>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">Total Evacuees</p>
                <h2 className="text-2xl font-bold text-blue-600">4,120</h2>
                </div>

            </div>
        </DashboardLayout>
    )
}

export default Dashboard;