import API from "../../api";

export interface ExportFilters {
  event_id?: string;
  center_id?: string;
  start_date?: string;
  end_date?: string;
  format?: "csv" | "pdf";
}

export const exportAnalyticsData = async (
  pathType: "dromic" | "demographics" | "utilization" | "vulnerable" | "resources" | "issues" | "daily-intake",
  filters: ExportFilters = {}
): Promise<void> => {
  const format = filters.format || "csv";
  const res = await API.get(`/api/analytics/export/${pathType}`, {
    params: filters,
    responseType: "blob",
  });

  // Extract filename from Content-Disposition header, or build a fallback
  const disposition = res.headers["content-disposition"];
  const extension = format === "pdf" ? "pdf" : "csv";
  let fileName = `${pathType}_export_${new Date().toISOString().slice(0, 10)}.${extension}`;

  if (disposition) {
    const match = disposition.match(/filename="?([^";\n]+)"?/);
    if (match?.[1]) {
      fileName = match[1];
    }
  }

  // Trigger browser download
  const mimeType = format === "pdf" ? "application/pdf" : "text/csv";
  const url = window.URL.createObjectURL(new Blob([res.data], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
