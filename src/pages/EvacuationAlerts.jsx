import React from "react";
import DashboardLayout from "../layout/DashboardLayout";
import Button from "../ui/Button";
const EvacuationAlerts = () => {
    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Evacuation Alerts</h1>
                <Button onClick={() => { }}>Create Alerts</Button>
            </div>
        </DashboardLayout>
    )
}

export default EvacuationAlerts