import React from "react";

const colorMap = {
    green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    gray: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
};

export const StatusBadge = ({ label, color = "gray" }) => {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full ${colorMap[color] || colorMap.gray}`}>
            {label}
        </span>
    );
};
