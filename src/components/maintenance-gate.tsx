import Spinner from "./Spinner";
import MaintenancePage from "./maintenance-page";
import { useMaintenanceMode } from "../hooks/useMaintenanceMode";

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { data: isMaintenance, isLoading, isFetching, refetch } = useMaintenanceMode();

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (isMaintenance) {
    return (
      <MaintenancePage onRetry={() => refetch()} isRetrying={isFetching} />
    );
  }

  return <>{children}</>;
}
