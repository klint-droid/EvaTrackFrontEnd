import { useEffect, useState } from "react";
import { getCenters } from "../../api/evacuation/getCenters";
import { getCapacity } from "../../api/evacuation/getCapacity";
import { deleteCenter } from "../../api/evacuation/deleteCenter";
import { isAdmin, isSuperAdmin } from "../../utils/roles";
import { Link } from "react-router-dom";

export default function EvacuationList() {
  const [centers, setCenters] = useState([]);

  const canCreate = isAdmin() || isSuperAdmin();
  const canEdit = isAdmin() || isSuperAdmin();
  const canDelete = isAdmin() || isSuperAdmin();

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const res = await getCenters();
      const centerList = res.data;

      const enriched = await Promise.all(
        centerList.map(async (c) => {
          try {
            // ✅ Always use evacuation_center_id
            const id = c.evacuation_center_id;

            if (!id) {
              console.warn("Missing ID:", c);
              return {
                ...c,
                current: 0,
                max: c.capacity || 0,
              };
            }

            const cap = await getCapacity(id);

            return {
              ...c,
              current: cap.data?.current ?? 0,
              max: cap.data?.max ?? c.capacity ?? 0,
            };
          } catch (err) {
            console.error("Capacity fetch failed:", err);
            return {
              ...c,
              current: 0,
              max: c.capacity || 0,
            };
          }
        })
      );

      setCenters(enriched);
    } catch (err) {
      console.error("Fetch centers failed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) return;

    if (confirm("Delete this center?")) {
      await deleteCenter(id);
      fetchCenters();
    }
  };

  const getStatus = (current, max) => {
    if (!max) return "Unknown";

    const percent = (current / max) * 100;

    if (percent >= 90) return "Critical";
    if (percent >= 60) return "Warning";
    return "Capable";
  };

  const getColor = (status) => {
    if (status === "Critical") return "bg-red-500";
    if (status === "Warning") return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Evacuation Centers</h2>

        {canCreate && (
          <Link
            to="/evacuation-centers/create"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Center
          </Link>
        )}
      </div>

      <table className="w-full bg-white shadow rounded-xl">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Name</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {centers.map((c) => {
            const status = getStatus(c.current, c.max);

            return (
              <tr
                key={c.evacuation_center_id || Math.random()}
                className="border-b"
              >
                <td className="p-3">{c.name}</td>
                <td>{c.location}</td>

                {/* ✅ CAPACITY */}
                <td>
                  <div>
                    <p className="text-sm">
                      {(c.current ?? 0)} / {(c.max ?? 0)}
                    </p>

                    <div className="w-full bg-gray-200 h-2 rounded mt-1">
                      <div
                        className={`${getColor(status)} h-2 rounded`}
                        style={{
                          width: `${
                            c.max
                              ? Math.min((c.current / c.max) * 100, 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* ✅ STATUS */}
                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
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

                {/* ✅ ACTIONS */}
                <td className="flex gap-3 p-3">
                  <Link
                    to={`/evacuation-centers/${c.evacuation_center_id}`}
                  >
                    View
                  </Link>

                  {canEdit && (
                    <Link
                      to={`/evacuation-centers/edit/${c.evacuation_center_id}`}
                    >
                      Edit
                    </Link>
                  )}

                  {canDelete && (
                    <button
                      onClick={() =>
                        handleDelete(c.evacuation_center_id)
                      }
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}