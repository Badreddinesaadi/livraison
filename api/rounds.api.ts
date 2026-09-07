import { client, Pagination } from "@/constants/client";
import { Round } from "@/types/rvt.types";

export const createRound = async (nom: string) => {
  const formData = new FormData();
  formData.append("nom", nom);

  return client.request<Round>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "POST",
    body: formData,
    isDebug: true,
  });
};

export const listRounds = async ({
  status,
  page = 1,
  perPage = 20,
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

export const updateRound = async ({
  id,
  nom,
  startedAt,
}: {
  id: string;
  nom?: string;
  startedAt?: string;
}) => {
  return client.request<Round>({
    pathname: "/sdkboard/api/rounds/rounds.php",
    method: "PATCH",
    searchParams: { id },
    body: {
      ...(nom !== undefined ? { nom } : {}),
      ...(startedAt !== undefined ? { startedAt } : {}),
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
