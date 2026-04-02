import { useState } from "react";
import API from "../api";

const VerifyHousehold = () => {
    const [input, setInput] = useState("");
    const [household, setHousehold] = useState(null);
    const [evacuation, setEvacuation] = useState(null);

    const handleVerify = async () => {
        try {
            const res = await API.post("/api/households/verify-household", {
                household_id: input.trim(),
            });

            setHousehold(res.data.data.household);
            setEvacuation(res.data.data.evacuation);
        } catch (err) {
            alert(err.response.data.message || "Verification failed");
            setHousehold(null);
            setEvacuation(null);
        }
    };

    const handleAssign = async () => {
        const roomId = prompt("Enter room ID to assign household to:");

        if (!roomId) return;

        try {
            await API.post(`/api/rooms/${roomId}/assign`, {
                household_id: household.household_id,
            });

            alert("Household assigned to room successfully!");
        } catch (err) {
            alert(err.response.data.message || "Assignment failed");
        }
    };

    return (
        <div>
            <h2>Verify Household</h2>

            <input
                placeholder="Scan QR or Enter Household ID"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            <button onClick={handleVerify}>Verify</button>

            {household && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Household Info</h3>

                    <p><b>ID:</b> {household.household_id}</p>
                    <p><b>Name:</b> {household.household_name}</p>
                    <p><b>Phone:</b> {household.phone_number}</p>

                    <p>
                        <b>Status:</b>{" "}
                        {evacuation?.is_verified ? "✅ Verified" : "❌ Not Verified"}
                    </p>

                    <button
                        onClick={handleAssign}
                        disabled={!evacuation?.is_verified}
                    >
                        Assign Room
                    </button>
                </div>
            )}
        </div>
    );
}

export default VerifyHousehold;