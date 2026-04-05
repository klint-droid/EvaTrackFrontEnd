// pages/evacuation/EvacuationForm.jsx
import { useState, useEffect } from "react";
import { createCenter } from "../../api/evacuation/createCenter";
import { updateCenter } from "../../api/evacuation/updateCenter";
import { getCenter } from "../../api/evacuation/getCenter";
import { useNavigate, useParams } from "react-router-dom";

export default function EvacuationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    location: "",
  });

  useEffect(() => {
    if (id) loadCenter();
  }, []);

  const loadCenter = async () => {
    const res = await getCenter(id);
    setForm(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id) {
      await updateCenter(id, form);
    } else {
      await createCenter(form);
    }

    navigate("/evacuation-centers");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Center" : "Create Center"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="Location"
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}