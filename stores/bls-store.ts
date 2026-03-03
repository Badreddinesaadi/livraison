import { BL } from "@/types/BL";
import { create } from "zustand";

type BlsState = {
  bls: BL[] | null;
  addBls: (newBls: BL[]) => void;
  removeBL: (blId: number) => void;
  removeAllBls: () => void;
};

export const useBlsStore = create<BlsState>((set) => ({
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
}));
