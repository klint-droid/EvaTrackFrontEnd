import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    LabelList,
} from "recharts";

// Custom label renderer that shows value inside the bar segment
const renderInsideLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (!value || height < 18) return null;
    return (
        <text
            x={x + width / 2}
            y={y + height / 2}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
        >
            {value}
        </text>
    );
};

const CapacityChart = ({ data }) => {
    // Transform data: compute percentages for stacked view
    // Bottom segment = capacity, Top segment = current occupancy
    const chartData = data.map((center) => {
        const total = center.max + center.current;
        const capacityPercent = total > 0 ? (center.max / total) * 100 : 0;
        const countPercent = total > 0 ? (center.current / total) * 100 : 0;
        return {
            name: center.name,
            capacity: Math.round(capacityPercent),
            count: Math.round(countPercent),
            rawCapacity: center.max,
            rawCount: center.current,
        };
    });

    // Custom tooltip to show raw values
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        const entry = chartData.find((d) => d.name === label);
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-sm">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-sm bg-[#4472C4] inline-block" />
                    <span className="text-slate-600">Capacity:</span>
                    <span className="font-bold text-slate-800">{entry?.rawCapacity}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#ED7D31] inline-block" />
                    <span className="text-slate-600">Occupancy:</span>
                    <span className="font-bold text-slate-800">{entry?.rawCount}</span>
                </div>
            </div>
        );
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                barCategoryGap="30%"
                barSize={80}
            >
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13, fontWeight: 600, fill: "#475569" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                />
                <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Legend
                    verticalAlign="bottom"
                    iconType="square"
                    iconSize={12}
                    wrapperStyle={{ paddingTop: 16, fontSize: 13, fontWeight: 600 }}
                    formatter={(value) => (
                        <span style={{ color: "#475569" }}>
                            {value === "capacity" ? "Capacity" : "Occupancy"}
                        </span>
                    )}
                />
                {/* Bottom segment: Capacity (blue) */}
                <Bar dataKey="capacity" stackId="stack" fill="#4472C4" radius={[0, 0, 0, 0]}>
                    <LabelList
                        dataKey="rawCapacity"
                        content={renderInsideLabel}
                    />
                </Bar>
                {/* Top segment: Occupancy Count (orange) */}
                <Bar dataKey="count" stackId="stack" fill="#ED7D31" radius={[4, 4, 0, 0]}>
                    <LabelList
                        dataKey="rawCount"
                        content={renderInsideLabel}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default CapacityChart;