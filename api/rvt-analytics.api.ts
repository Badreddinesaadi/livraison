import { client } from "@/constants/client";
import { DashboardData } from "@/types/rvt.types";

export const getAnalytics = async ({
  roundId,
  clientId,
  city,
  from,
  to,
}: {
  roundId?: string;
  clientId?: string;
  city?: string;
  from?: string;
  to?: string;
} = {}) => {
  return client.request<DashboardData>({
    pathname: "/sdkboard/api/rounds/analytics.php",
    method: "GET",
    searchParams: { roundId, clientId, city, from, to },
    isDebug: false,
  });
};
