import axios from "axios";

export default function updateMaintenanceMode(
  token: string,
  maintenance_mode: boolean
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}settings/maintenance`;
  return axios.put(
    apiUrl,
    { maintenance_mode },
    {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
