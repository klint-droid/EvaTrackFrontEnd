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
    capacity: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) loadCenter();
  }, [id]);

  // 🔥 Load existing data (edit mode)
  const loadCenter = async () => {
    try {
      const res = await getCenter(id);

      setForm({
        name: res.data.name || "",
        location: res.data.location || "",
        capacity: res.data.capacity || ""
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({}); // reset errors

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity)
      };

      if (id) {
        await updateCenter(id, payload);
      } else {
        await createCenter(payload);
      }

      // ✅ success
      navigate("/evacuation-centers");

    } catch (err) {
      console.error(err.response?.data);

      // 🔥 Laravel validation errors
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || "Something went wrong");
      }
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Center" : "Create Center"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* NAME */}
        <div>
          <input
            className="border p-2 w-full rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name[0]}</p>
          )}
        </div>

        {/* LOCATION */}
        <div>
          <input
            className="border p-2 w-full rounded"
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
          />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location[0]}</p>
          )}
        </div>

        {/* CAPACITY */}
        <div>
          <input
            type="number"
            className="border p-2 w-full rounded"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: e.target.value })
            }
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm">{errors.capacity[0]}</p>
          )}
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>

      </form>
    </div>
  );
}