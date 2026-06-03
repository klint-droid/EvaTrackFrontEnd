import API from "../../api";

export type ExportType = "household" | "member";

export const exportCenterData = async (
  centerId: string,
  type: ExportType = "member"
): Promise<void> => {
  const res = await API.get(`/api/evacuation-centers/${centerId}/export`, {
    params: { type },
    responseType: "blob",
  });

  // Extract filename from Content-Disposition header, or build a fallback
  const disposition = res.headers["content-disposition"];
  let fileName = `Evacuees_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

  if (disposition) {
    const match = disposition.match(/filename="?([^";\n]+)"?/);
    if (match?.[1]) {
      fileName = match[1];
    }
  }

  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
