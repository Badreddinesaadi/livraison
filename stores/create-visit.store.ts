import { create } from "zustand";
import {
  ActivityLevel,
  ContactRole,
  ErpClient,
  Location,
  NextAction,
  ObservedActivity,
  ObservedBrandInput,
  ObservedProductInput,
  OpportunityHorizon,
  OpportunityPotential,
  ParkSize,
  PresenceLevel,
  SDKPosition,
  VisitResult,
} from "@/types/rvt.types";

export type PendingVisitPhoto = {
  uri: string;
  name: string;
  type: string;
  capturedAt: string;
};

type CreateVisitState = {
  type: "create" | "update";
  roundId: string | null;
  visitId: string | null;
  version: number | null;
  startedAt: Date | null;

  client: ErpClient | null;
  location: Location | null;
  contactRole: ContactRole | null;
  contactOther: string;
  activityLevel: ActivityLevel | null;

  observedActivity: ObservedActivity | null;
  offersCutting: boolean | null;
  constructionType: string | null;
  constructionPhase: string | null;
  signPhoto: PendingVisitPhoto | null;
  industrialActivities: string[];
  industrialOther: string;
  equipment: string[];
  equipmentQuantities: Record<string, number>;
  siteSize: ParkSize | null;

  products: ObservedProductInput[];
  otherProduct: string;
  brands: ObservedBrandInput[];

  sdkPosition: SDKPosition | null;
  competitors: {
    competitorId: string;
    presence?: PresenceLevel;
  }[];
  opportunityDetected: boolean | null;
  oppProductId: string | null;
  oppPotential: OpportunityPotential | null;
  oppHorizon: OpportunityHorizon | null;
  oppAmount: string;
  oppCompetitorId: string | null;

  results: VisitResult[];
  orderSolo: string;
  orderSemiCombined: string;
  nextAction: NextAction | null;
  nextActionDueAt: Date | null;
  note: string;
  photos: PendingVisitPhoto[];

  setClient: (client: ErpClient | null) => void;
  setLocation: (location: Location | null) => void;
  setContactRole: (contactRole: ContactRole | null) => void;
  setContactOther: (contactOther: string) => void;
  setActivityLevel: (activityLevel: ActivityLevel | null) => void;
  setRoundId: (roundId: string | null) => void;
  setStartedAt: (startedAt: Date | null) => void;
  resetVisitFields: () => void;

  setObservedActivity: (observedActivity: ObservedActivity | null) => void;
  setOffersCutting: (offersCutting: boolean | null) => void;
  setConstructionType: (constructionType: string | null) => void;
  setConstructionPhase: (constructionPhase: string | null) => void;
  setSignPhoto: (signPhoto: PendingVisitPhoto | null) => void;
  setIndustrialActivities: (industrialActivities: string[]) => void;
  setIndustrialOther: (industrialOther: string) => void;
  toggleEquipment: (equipment: string) => void;
  setEquipmentQuantity: (equipment: string, quantity: number) => void;
  setSiteSize: (siteSize: ParkSize | null) => void;

  addProduct: (product: ObservedProductInput) => void;
  updateProduct: (lineId: string, patch: Partial<ObservedProductInput>) => void;
  removeProduct: (lineId: string) => void;
  setOtherProduct: (otherProduct: string) => void;
  addBrand: (brandId: string, presence?: PresenceLevel) => void;
  removeBrand: (brandId: string) => void;
  setBrandPresence: (brandId: string, presence: PresenceLevel) => void;

  setSdkPosition: (sdkPosition: SDKPosition | null) => void;
  toggleCompetitor: (competitorId: string, presence?: PresenceLevel) => void;
  setCompetitorPresence: (
    competitorId: string,
    presence: PresenceLevel,
  ) => void;
  removeCompetitor: (competitorId: string) => void;
  setOpportunityDetected: (detected: boolean | null) => void;
  setOppProductId: (oppProductId: string | null) => void;
  setOppPotential: (oppPotential: OpportunityPotential | null) => void;
  setOppHorizon: (oppHorizon: OpportunityHorizon | null) => void;
  setOppAmount: (oppAmount: string) => void;
  setOppCompetitorId: (oppCompetitorId: string | null) => void;

  toggleResult: (result: VisitResult) => void;
  setOrderSolo: (orderSolo: string) => void;
  setOrderSemiCombined: (orderSemiCombined: string) => void;
  setNextAction: (nextAction: NextAction | null) => void;
  setNextActionDueAt: (nextActionDueAt: Date | null) => void;
  setNote: (note: string) => void;
  addPhoto: (photo: PendingVisitPhoto) => void;
  removePhoto: (uri: string) => void;

  configureEdit: (data: {
    visitId: string;
    version: number;
    roundId: string;
    startedAt: string;
  }) => void;
  hydrateFromReport: (report: {
    client: ErpClient;
    location: Location;
    contactRole?: ContactRole;
    contactOther?: string;
    activityLevel?: ActivityLevel;
    observedActivity?: ObservedActivity;
    offersCutting?: boolean | null;
    constructionType?: string;
    constructionPhase?: string;
    industrialActivities?: string[];
    industrialOther?: string;
    equipment?: string[];
    equipmentQuantities?: Record<string, number>;
    siteSize?: ParkSize;
    products?: ObservedProductInput[];
    otherProduct?: string;
    brands?: ObservedBrandInput[];
    sdkPosition?: SDKPosition;
    competitors?: { competitorId: string; presence?: PresenceLevel }[];
    opportunityDetected?: boolean | null;
    oppProductId?: string | null;
    oppPotential?: OpportunityPotential | null;
    oppHorizon?: OpportunityHorizon | null;
    oppAmount?: string;
    oppCompetitorId?: string | null;
    results?: VisitResult[];
    orderSolo?: string;
    orderSemiCombined?: string;
    nextAction?: NextAction | null;
    nextActionDueAt?: string | null;
    note?: string;
  }) => void;
  resetAll: () => void;
};

const initialState = {
  type: "create" as const,
  roundId: null,
  visitId: null,
  version: null,
  startedAt: null,

  client: null as ErpClient | null,
  location: null as Location | null,
  contactRole: null as ContactRole | null,
  contactOther: "",
  activityLevel: null as ActivityLevel | null,

  observedActivity: null as ObservedActivity | null,
  offersCutting: null as boolean | null,
  constructionType: null as string | null,
  constructionPhase: null as string | null,
  signPhoto: null as PendingVisitPhoto | null,
  industrialActivities: [] as string[],
  industrialOther: "",
  equipment: [] as string[],
  equipmentQuantities: {} as Record<string, number>,
  siteSize: null as ParkSize | null,

  products: [] as ObservedProductInput[],
  otherProduct: "",
  brands: [] as ObservedBrandInput[],

  sdkPosition: null as SDKPosition | null,
  competitors: [] as { competitorId: string; presence?: PresenceLevel }[],
  opportunityDetected: null as boolean | null,
  oppProductId: null as string | null,
  oppPotential: null as OpportunityPotential | null,
  oppHorizon: null as OpportunityHorizon | null,
  oppAmount: "",
  oppCompetitorId: null as string | null,

  results: [] as VisitResult[],
  orderSolo: "",
  orderSemiCombined: "",
  nextAction: null as NextAction | null,
  nextActionDueAt: null as Date | null,
  note: "",
  photos: [] as PendingVisitPhoto[],
};

export const useCreateVisitStore = create<CreateVisitState>((set) => ({
  ...initialState,

  setClient: (client) => set({ client }),
  setLocation: (location) => set({ location }),
  setContactRole: (contactRole) => set({ contactRole }),
  setContactOther: (contactOther) => set({ contactOther }),
  setActivityLevel: (activityLevel) => set({ activityLevel }),
  setRoundId: (roundId) => set({ roundId }),
  setStartedAt: (startedAt) => set({ startedAt }),
  resetVisitFields: () =>
    set((state) => ({
      ...initialState,
      roundId: state.roundId,
      startedAt: null,
    })),

  setObservedActivity: (observedActivity) => set({ observedActivity }),
  setOffersCutting: (offersCutting) => set({ offersCutting }),
  setConstructionType: (constructionType) => set({ constructionType }),
  setConstructionPhase: (constructionPhase) => set({ constructionPhase }),
  setSignPhoto: (signPhoto) => set({ signPhoto }),
  setIndustrialActivities: (industrialActivities) =>
    set({ industrialActivities }),
  setIndustrialOther: (industrialOther) => set({ industrialOther }),
  toggleEquipment: (equipment) =>
    set((state) => {
      if (state.equipment.includes(equipment)) {
        const quantities = { ...state.equipmentQuantities };
        delete quantities[equipment];
        return {
          equipment: state.equipment.filter((e) => e !== equipment),
          equipmentQuantities: quantities,
        };
      }
      return {
        equipment: [...state.equipment, equipment],
        equipmentQuantities: {
          ...state.equipmentQuantities,
          [equipment]: 1,
        },
      };
    }),
  setEquipmentQuantity: (equipment, quantity) =>
    set((state) => ({
      equipmentQuantities: {
        ...state.equipmentQuantities,
        [equipment]: quantity,
      },
    })),
  setSiteSize: (siteSize) => set({ siteSize }),

  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  updateProduct: (lineId, patch) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.lineId === lineId ? { ...p, ...patch } : p,
      ),
    })),
  removeProduct: (lineId) =>
    set((state) => ({
      products: state.products.filter((p) => p.lineId !== lineId),
    })),
  setOtherProduct: (otherProduct) => set({ otherProduct }),
  addBrand: (brandId, presence) =>
    set((state) => {
      if (state.brands.some((b) => b.brandId === brandId)) return state;
      return { brands: [...state.brands, { brandId, presence }] };
    }),
  removeBrand: (brandId) =>
    set((state) => ({
      brands: state.brands.filter((b) => b.brandId !== brandId),
    })),
  setBrandPresence: (brandId, presence) =>
    set((state) => ({
      brands: state.brands.map((b) =>
        b.brandId === brandId ? { ...b, presence } : b,
      ),
    })),

  setSdkPosition: (sdkPosition) => set({ sdkPosition }),
  toggleCompetitor: (competitorId, presence) =>
    set((state) => {
      if (state.competitors.some((c) => c.competitorId === competitorId)) {
        return {
          competitors: state.competitors.filter(
            (c) => c.competitorId !== competitorId,
          ),
        };
      }
      return { competitors: [...state.competitors, { competitorId, presence }] };
    }),
  setCompetitorPresence: (competitorId, presence) =>
    set((state) => ({
      competitors: state.competitors.map((c) =>
        c.competitorId === competitorId ? { ...c, presence } : c,
      ),
    })),
  removeCompetitor: (competitorId) =>
    set((state) => ({
      competitors: state.competitors.filter(
        (c) => c.competitorId !== competitorId,
      ),
    })),
  setOpportunityDetected: (opportunityDetected) => set({ opportunityDetected }),
  setOppProductId: (oppProductId) => set({ oppProductId }),
  setOppPotential: (oppPotential) => set({ oppPotential }),
  setOppHorizon: (oppHorizon) => set({ oppHorizon }),
  setOppAmount: (oppAmount) => set({ oppAmount }),
  setOppCompetitorId: (oppCompetitorId) => set({ oppCompetitorId }),

  toggleResult: (result) =>
    set((state) => ({
      results: state.results.includes(result)
        ? state.results.filter((r) => r !== result)
        : [...state.results, result],
    })),
  setOrderSolo: (orderSolo) => set({ orderSolo }),
  setOrderSemiCombined: (orderSemiCombined) => set({ orderSemiCombined }),
  setNextAction: (nextAction) => set({ nextAction }),
  setNextActionDueAt: (nextActionDueAt) => set({ nextActionDueAt }),
  setNote: (note) => set({ note }),
  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
  removePhoto: (uri) =>
    set((state) => ({ photos: state.photos.filter((p) => p.uri !== uri) })),

  configureEdit: (data) =>
    set({
      type: "update",
      visitId: data.visitId,
      version: data.version,
      roundId: data.roundId,
      startedAt: new Date(data.startedAt),
    }),
  hydrateFromReport: (report) =>
    set({
      ...report,
      nextActionDueAt: report.nextActionDueAt
        ? new Date(report.nextActionDueAt)
        : null,
    }),
  resetAll: () => set({ ...initialState }),
}));
