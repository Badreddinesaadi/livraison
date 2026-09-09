import { client, Pagination } from "@/constants/client";
import { Round } from "@/types/rvt.types";

export const createRound = async ({
  nom,
  startedAt,
  closedAt,
}: {
  nom: string;
  startedAt?: string;
  closedAt?: string;
}) => {
  const formData = new FormData();
  formData.append("nom", nom);
  if (startedAt) formData.append("startedAt", startedAt);
  if (closedAt) formData.append("closedAt", closedAt);

  return client.request<Round>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "POST",
    body: formData,
    isDebug: true,
  });
};

export const listRounds = async ({
  nom,
  status,
  from,
  to,
  page = 1,
  perPage = 20,
}: {
  nom?: string;
  status?: "open" | "closed";
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}) => {
  const result = await client.request<Round[]>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "GET",
    searchParams: { nom, status, from, to, page, perPage },
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

export const updateRound = async ({
  id,
  nom,
  startedAt,
  closedAt,
}: {
  id: string;
  nom?: string;
  startedAt?: string;
  closedAt?: string | null;
}) => {
  return client.request<Round>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "PATCH",
    searchParams: { id },
    body: {
      ...(nom !== undefined ? { nom } : {}),
      ...(startedAt !== undefined ? { startedAt } : {}),
      ...(closedAt !== undefined ? { closedAt } : {}),
    },
    isDebug: true,
  });
};

export const deleteRound = async ({ id }: { id: string }) => {
  return client.request<null>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "DELETE",
    searchParams: { id },
    isDebug: true,
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

export const reopenRound = async ({ id }: { id: string }) => {
  return client.request<Round>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "POST",
    searchParams: { action: "open", id },
    body: { status: "open" },
    isDebug: true,
  });
};
