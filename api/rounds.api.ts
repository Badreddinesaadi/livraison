import { client, Pagination } from "@/constants/client";
import { Round } from "@/types/rvt.types";

export const createRound = async (startedAt?: string) => {
  return client.request<Round>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "POST",
    searchParams: { idempotencyKey: `${Date.now()}-round` },
    body: startedAt ? { startedAt } : undefined,
    isDebug: true,
  });
};

export const listRounds = async ({
  status,
  page = 1,
  perPage = 50,
}: {
  status?: "open" | "closed";
  page?: number;
  perPage?: number;
}) => {
  const result = await client.request<Round[]>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "GET",
    searchParams: { status, page, perPage },
    isDebug: false,
    withPagination: true,
  });

  return {
    data: result.data,
    pagination: result.pagination as Pagination | null,
  };
};

export const getRoundById = async ({ id }: { id: string }) => {
  return client.request<Round>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "GET",
    searchParams: { id },
    isDebug: false,
  });
};

export const closeRound = async ({ id }: { id: string }) => {
  return client.request<Round>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "POST",
    searchParams: { action: "close", id },
    isDebug: true,
  });
};
