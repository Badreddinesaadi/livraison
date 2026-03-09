import { BL } from "@/types/bl.types";
import { Chauffeur, Depot, Vehicle } from "@/types/user.types";
import { create } from "zustand";

type BlsState = {
  bls: BL[] | null;
  type: "update" | "create";
  addBls: (newBls: BL[]) => void;
  setBls: (bls: BL[] | null) => void;
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
  dateDepart: Date | null;
  setDateDepart: (date: Date) => void;
  idVoyage: number | null;
  setIdVoyage: (id: number | null) => void;
  setType: (type: "update" | "create") => void;
  resetAll: () => void;
};

export const useCreateVoyageStore = create<BlsState>((set) => ({
  bls: null,
  type: "create",
  removeAllBls: () => set({ bls: null }),
  addBls: (newBls: BL[]) =>
    set((state) => {
      if (!state.bls) {
        return { bls: newBls };
      }
      const uniqueBls = [...new Set([...state.bls, ...newBls])];
      return { bls: uniqueBls };
    }),
  setBls: (bls: BL[] | null) => set({ bls }),
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
  dateDepart: null,
  setDateDepart: (date: Date) => set({ dateDepart: date }),
  idVoyage: null,
  setIdVoyage: (id: number | null) => set({ idVoyage: id }),
  resetAll: () =>
    set({
      bls: null,
      selectedChauffeur: null,
      selectedVehicle: null,
      selectedDepot: null,
      kmDepart: 0,
      dateDepart: null,
      idVoyage: null,
    }),
  setType: (type: "update" | "create") => set({ type }),
}));
