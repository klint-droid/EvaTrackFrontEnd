import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const CapacityChart = ({ data }) => {
    return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <h3 className="mb-4 font-semibold">Center Capacity</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="current" />
          <Bar dataKey="max" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CapacityChart;