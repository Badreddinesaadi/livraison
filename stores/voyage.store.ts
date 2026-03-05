import { BL } from "@/types/bl.types";
import { Chauffeur, Depot, Vehicle } from "@/types/user.types";
import { create } from "zustand";

type BlsState = {
  bls: BL[] | null;
  addBls: (newBls: BL[]) => void;
  removeBL: (blId: number) => void;
  removeAllBls: () => void;
  selectedChauffeur: Chauffeur | null;
  setSelectedChauffeur: (chauffeur: Chauffeur) => void;
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle) => void;
  selectedDepot: Depot | null;
  setSelectedDepot: (depot: Depot) => void;
  kmDepart: number;
  setKmDepart: (km: number) => void;
};

export const useCreateVoyageStore = create<BlsState>((set) => ({
  bls: null,
  removeAllBls: () => set({ bls: null }),
  addBls: (newBls: BL[]) =>
    set((state) => {
      if (!state.bls) {
        return { bls: newBls };
      }
      const uniqueBls = [...new Set([...state.bls, ...newBls])];
      return { bls: uniqueBls };
    }),
  removeBL: (blId: number) =>
    set((state) => {
      if (!state.bls) return state;
      const updatedBls = state.bls.filter((bl) => bl.id !== blId);
      return { bls: updatedBls };
    }),
  selectedChauffeur: null,
  setSelectedChauffeur: (chauffeur: Chauffeur) =>
    set({ selectedChauffeur: chauffeur }),
  selectedVehicle: null,
  setSelectedVehicle: (vehicle: Vehicle) => set({ selectedVehicle: vehicle }),
  selectedDepot: null,
  setSelectedDepot: (depot: Depot) => set({ selectedDepot: depot }),
  kmDepart: 0,
  setKmDepart: (km: number) => set({ kmDepart: km }),
}));
