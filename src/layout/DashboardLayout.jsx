import React from "react";
import Sidebar from "../components/SideBar";
import TopBar from "../components/TopBar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <TopBar />

                <div className="p-6 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;