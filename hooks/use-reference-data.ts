import { getReferenceData } from "@/api/reference-data.api";
import { useQuery } from "@tanstack/react-query";

export const useReferenceData = () => {
  return useQuery({
    queryKey: ["reference-data"],
    queryFn: () => getReferenceData(),
    staleTime: 1000 * 60 * 60 * 6,
  });
};
