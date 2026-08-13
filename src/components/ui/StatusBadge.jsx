import React from "react";
import { StatusBadge as BaseStatusBadge } from "../../ui/Table";

export const StatusBadge = ({ label, value, color, type, className = "" }) => {
  return <BaseStatusBadge label={label} value={value} color={color} type={type} className={className} />;
};

export default StatusBadge;
