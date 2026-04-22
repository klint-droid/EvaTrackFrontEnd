import { useState } from "react";
import { createPortal } from "react-dom";
import { X, DoorOpen, Loader2 } from "lucide-react";
import { createRoom } from "../../api/rooms/createRoom";

export default function RoomModal({ centerId, onClose, onSuccess }) {
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!roomNumber.trim() || !capacity) {
      alert("Please fill all fields");
      return;
    }

    if (Number(capacity) <= 0) {
      alert("Capacity must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        center_id: centerId,
        room_number: roomNumber.trim(),
        max_capacity: Number(capacity),
      };

      await createRoom(payload);
      setRoomNumber("");
      setCapacity("");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        alert(errors.join("\n"));
      } else {
        alert(err.response?.data?.message || "Failed to create room");
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
      {/* 🌑 DARK OVERLAY */}
      <div 
        className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
        onClick={!loading ? onClose : undefined} 
      />

      {/* 📦 COMPACT MODAL CARD */}
      <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-[320px] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
            <DoorOpen size={16} className="text-blue-600" /> Add New Room
          </h2>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
              Room Identifier
            </label>
            <input
              type="text"
              placeholder="e.g. Room 101"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
              Max Occupancy
            </label>
            <input
              type="number"
              placeholder="0"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end items-center gap-3">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            {loading ? "Saving..." : "Create Room"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}