import axios from "axios";

export default async function getMaintenanceMode(): Promise<boolean> {
  const apiUrl = `${import.meta.env.VITE_API_URL}settings/maintenance`;
  const res = await axios.get(apiUrl, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
    },
  });
  return Boolean(res.data?.date?.maintenance_mode);
}
