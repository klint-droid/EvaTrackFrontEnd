import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LabelList,
} from "recharts";

// Formatter for values (e.g. 1500 -> 1.5k, 12000 -> 12k, 55 -> 55)
const formatNumber = (num) => {
    if (num === null || num === undefined) return "";
    const n = Number(num);
    if (isNaN(n)) return num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return n.toLocaleString();
};

// Multi-line formatter for complete evacuation center names (no abbreviations or shortcuts)
const getCompleteCenterLines = (fullName) => {
    if (!fullName) return ["Center"];
    const trimmed = fullName.trim();

    // Specific clean splits for compound facility names
    if (trimmed.toLowerCase().includes("gymnasium / covered court")) {
        const prefix = trimmed.replace(/gymnasium \/ covered court/i, "").trim();
        return [prefix, "Gymnasium /", "Covered Court"].filter(Boolean);
    }

    // Split after first word (locality/barangay e.g. "Mambaling", "Alaska")
    const words = trimmed.split(/\s+/);
    if (words.length <= 1) return [trimmed];
    if (words.length === 2) return [words[0], words[1]];
    if (words.length === 3) return [words[0], `${words[1]} ${words[2]}`];
    if (words.length === 4) return [words[0], `${words[1]} ${words[2]} ${words[3]}`];

    // Fallback: wrap every ~16-18 characters
    const lines = [];
    let current = "";
    for (const w of words) {
        if (!current) {
            current = w;
        } else if ((current + " " + w).length <= 18) {
            current += " " + w;
        } else {
            lines.push(current);
            current = w;
        }
    }
    if (current) lines.push(current);
    return lines;
};

// Custom inside label for stacked bar segments (Occupied / Available)
const renderInsideLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (!value || height < 18) return null;
    return (
        <text
            x={x + width / 2}
            y={y + height / 2}
            fill="#ffffff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={width < 45 ? 11 : 12}
            fontWeight={700}
            className="select-none pointer-events-none drop-shadow-xs"
        >
            {formatNumber(value)}
        </text>
    );
};

// Custom label for total capacity on top of the stacked bar
const renderTopTotalLabel = (props) => {
    const { x, y, width, value } = props;
    if (value === undefined || value === null) return null;
    return (
        <text
            x={x + width / 2}
            y={y - 8}
            fill="#334155"
            textAnchor="middle"
            fontSize={width < 45 ? 11 : 12}
            fontWeight={800}
            className="fill-slate-700 dark:fill-slate-200 select-none pointer-events-none"
        >
            {formatNumber(value)}
        </text>
    );
};

// Custom X-Axis Tick: horizontal (not slanted), centered, complete name without shortcuts
const renderCustomXAxisTick = (props) => {
    const { x, y, payload } = props;
    if (!payload || payload.value === undefined) return null;
    const fullName = String(payload.value);
    const lines = getCompleteCenterLines(fullName);

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={9}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight={600}
                className="fill-slate-600 dark:fill-slate-300 select-none"
            >
                {lines.map((line, idx) => (
                    <tspan key={idx} x={0} dy={idx === 0 ? 0 : 10.5}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
};

// Custom Tooltip with detailed breakdown
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3.5 text-xs z-50 min-w-[210px] text-left">
            <p className="font-bold text-slate-900 dark:text-slate-100 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                {entry.name}
            </p>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#1E78C2]" />
                        Occupied:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                        {Number(entry.rawCount).toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#F37021]" />
                        Available Slots:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                        {Number(entry.available).toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-slate-100 dark:border-slate-800 font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Total Capacity:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                        {Number(entry.rawCapacity).toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[11px] pt-1">
                    <span className="text-slate-400">Occupancy Rate:</span>
                    <span
                        className={`font-bold ${
                            entry.pct >= 90
                                ? "text-rose-500"
                                : entry.pct >= 60
                                ? "text-amber-500"
                                : "text-emerald-500"
                        }`}
                    >
                        {entry.pct}%
                    </span>
                </div>
            </div>
        </div>
    );
};

const CapacityChart = ({ data = [] }) => {
    // Transform center data into stacked metrics:
    // Bottom layer: Occupied (Blue #1E78C2)
    // Top layer: Available Slots (Orange #F37021)
    // Total Bar Height: Total Center Capacity (displayed above the bar)
    const chartData = data.map((center) => {
        const rawCap = Math.max(Number(center.max) || 0, 0);
        const rawOcc = Math.max(Number(center.current) || 0, 0);
        const avail = Math.max(rawCap - rawOcc, 0);
        const total = rawCap > 0 ? rawCap : rawOcc;

        return {
            name: center.name,
            occupied: rawOcc,
            available: avail,
            totalCapacity: total,
            rawCapacity: rawCap,
            rawCount: rawOcc,
            pct: rawCap > 0 ? Math.round((rawOcc / rawCap) * 100) : 0,
        };
    });

    const maxVal = Math.max(...chartData.map((d) => d.totalCapacity), 10);
    const domainMax = Math.ceil(maxVal * 1.15);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 25, right: 20, left: 0, bottom: 6 }}
                barCategoryGap="25%"
                barSize={55}
            >
                {/* Subtle horizontal grid lines */}
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    opacity={0.7}
                />

                {/* Left Y-Axis */}
                <YAxis
                    tickFormatter={formatNumber}
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={{ stroke: "#cbd5e1" }}
                    domain={[0, domainMax]}
                />

                {/* Right Y-Axis (matching user reference image style) */}
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={formatNumber}
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={{ stroke: "#cbd5e1" }}
                    domain={[0, domainMax]}
                />

                {/* X-Axis: interval={0} ensures NO labels are skipped */}
                <XAxis
                    dataKey="name"
                    interval={0}
                    height={42}
                    tick={renderCustomXAxisTick}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={{ stroke: "#cbd5e1" }}
                />

                {/* Interactive Tooltip */}
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                />

                {/* Bottom Bar: Occupied (Blue #1E78C2) */}
                <Bar
                    dataKey="occupied"
                    stackId="capacityStack"
                    fill="#1E78C2"
                    radius={[0, 0, 0, 0]}
                >
                    <LabelList
                        dataKey="occupied"
                        content={renderInsideLabel}
                    />
                </Bar>

                {/* Top Bar: Available Slots (Orange #F37021) */}
                <Bar
                    dataKey="available"
                    stackId="capacityStack"
                    fill="#F37021"
                    radius={[2, 2, 0, 0]}
                >
                    <LabelList
                        dataKey="available"
                        content={renderInsideLabel}
                    />
                    {/* Total capacity labeled above the top of the bar */}
                    <LabelList
                        dataKey="totalCapacity"
                        content={renderTopTotalLabel}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default CapacityChart;