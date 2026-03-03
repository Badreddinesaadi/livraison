import { BL } from "@/types/BL";

export const listBLSEnCours = async (): Promise<BL[] | undefined> => {
  // wait 2 secondes and return a list of voyages
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "BL-2134asdqkoqjscnw",
          date: "2024-06-01",
          status: "En cours",
        },
        {
          id: 2,
          name: "BL-sq^dkqpjùdjsdjq",
          date: "2024-06-01",
          status: "En cours",
        },
        {
          id: 3,
          name: "BL-3456789012345678",
          date: "2024-06-02",
          status: "En cours",
        },
        {
          id: 4,
          name: "BL-9876543210987654",
          date: "2024-06-03",
          status: "En cours",
        },
        {
          id: 5,
          name: "BL-65654651231326",
          date: "2024-06-03",
          status: "En cours",
        },
        {
          id: 6,
          name: "BL-54654145679651",
          date: "2024-06-03",
          status: "En cours",
        },
        {
          id: 7,
          name: "BL-6798652134685134",
          date: "2024-06-03",
          status: "En cours",
        },
      ]);
    }, 2000);
  });
};
