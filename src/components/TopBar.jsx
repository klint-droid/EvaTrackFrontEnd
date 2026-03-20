import React from "react";

const TopBar = () => {
    return (
        <div className="flex justify-between items-center bg-white px-6 py-4 shadow-sm">
            <h2 className="text-xl font-semibold">Operations Dashboard</h2>

            <div className="flex items-center gap-4">
                <span className="text-green-600 text-sm font-semibold">
                    SYSTEM ONLINE
                </span>

                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    👤
                </div>
            </div>
        </div>
    );
};

export default TopBar;