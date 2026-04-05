// pages/evacuation/EvacuationList.jsx
import { useEffect, useState } from "react";
import { getCenters } from "../../api/evacuation/getCenters";
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
    const res = await getCenters();
    setCenters(res.data);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this center?")) {
      await deleteCenter(id);
      fetchCenters();
    }
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {centers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-3">{c.name}</td>
              <td>{c.location}</td>

              <td className="flex gap-3 p-3">
                <Link to={`/evacuation-centers/${c.id}`}>
                  View
                </Link>

                {canEdit && (
                  <Link to={`/evacuation-centers/edit/${c.id}`}>
                    Edit
                  </Link>
                )}

                {canDelete && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}