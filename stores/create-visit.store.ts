import { create } from "zustand";
import {
  ActivityLevel,
  ContactRole,
  ErpClient,
  Location,
  NextAction,
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

  activiteObserveeId: number | null;
  serviceDecoupe: boolean | null;
  chantierTypeId: number | null;
  chantierPhaseId: number | null;
  signPhoto: PendingVisitPhoto | null;
  activitesIndustriellesIds: number[];
  industrialOther: string;
  equipementIds: number[];
  equipementQuantites: Record<string, number>;
  siteSize: ParkSize | null;
  categorie1Id: number | null;
  categorie2Id: number | null;
  categorie3Id: number | null;

  products: ObservedProductInput[];
  otherProduct: string;
  brands: ObservedBrandInput[];

  sdkPosition: SDKPosition | null;
  competitors: {
    competitorId: number;
    presence?: PresenceLevel;
  }[];
  opportunityDetected: boolean | null;
  oppProductId: string | null;
  oppPotential: OpportunityPotential | null;
  oppHorizon: OpportunityHorizon | null;
  oppAmount: string;
  oppCompetitorId: number | null;

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

  setActiviteObserveeId: (activiteObserveeId: number | null) => void;
  setServiceDecoupe: (serviceDecoupe: boolean | null) => void;
  setChantierTypeId: (chantierTypeId: number | null) => void;
  setChantierPhaseId: (chantierPhaseId: number | null) => void;
  setSignPhoto: (signPhoto: PendingVisitPhoto | null) => void;
  toggleActiviteIndustrielle: (id: number) => void;
  setIndustrialOther: (industrialOther: string) => void;
  toggleEquipement: (id: number) => void;
  setEquipementQuantity: (id: number, quantity: number) => void;
  clearEquipements: () => void;
  setSiteSize: (siteSize: ParkSize | null) => void;
  setCategorie1Id: (categorie1Id: number | null) => void;
  setCategorie2Id: (categorie2Id: number | null) => void;
  setCategorie3Id: (categorie3Id: number | null) => void;

  addProduct: (product: ObservedProductInput) => void;
  updateProduct: (lineId: string, patch: Partial<ObservedProductInput>) => void;
  removeProduct: (lineId: string) => void;
  setOtherProduct: (otherProduct: string) => void;
  addBrand: (brandId: number, presence?: PresenceLevel) => void;
  removeBrand: (brandId: number) => void;
  setBrandPresence: (brandId: number, presence: PresenceLevel) => void;

  setSdkPosition: (sdkPosition: SDKPosition | null) => void;
  toggleCompetitor: (competitorId: number, presence?: PresenceLevel) => void;
  setCompetitorPresence: (
    competitorId: number,
    presence: PresenceLevel,
  ) => void;
  removeCompetitor: (competitorId: number) => void;
  setOpportunityDetected: (detected: boolean | null) => void;
  setOppProductId: (oppProductId: string | null) => void;
  setOppPotential: (oppPotential: OpportunityPotential | null) => void;
  setOppHorizon: (oppHorizon: OpportunityHorizon | null) => void;
  setOppAmount: (oppAmount: string) => void;
  setOppCompetitorId: (oppCompetitorId: number | null) => void;

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
    activiteObserveeId?: number | null;
    serviceDecoupe?: boolean | null;
    chantierTypeId?: number | null;
    chantierPhaseId?: number | null;
    activitesIndustriellesIds?: number[];
    industrialOther?: string;
    signPhoto?: PendingVisitPhoto | null;
    equipementIds?: number[];
    equipementQuantites?: Record<string, number>;
    siteSize?: ParkSize;
    categorie1Id?: number | null;
    categorie2Id?: number | null;
    categorie3Id?: number | null;
    products?: ObservedProductInput[];
    otherProduct?: string;
    brands?: ObservedBrandInput[];
    sdkPosition?: SDKPosition;
    competitors?: { competitorId: number; presence?: PresenceLevel }[];
    opportunityDetected?: boolean | null;
    oppProductId?: string | null;
    oppPotential?: OpportunityPotential | null;
    oppHorizon?: OpportunityHorizon | null;
    oppAmount?: string;
    oppCompetitorId?: number | null;
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

  activiteObserveeId: null as number | null,
  serviceDecoupe: null as boolean | null,
  chantierTypeId: null as number | null,
  chantierPhaseId: null as number | null,
  signPhoto: null as PendingVisitPhoto | null,
  activitesIndustriellesIds: [] as number[],
  industrialOther: "",
  equipementIds: [] as number[],
  equipementQuantites: {} as Record<string, number>,
  siteSize: null as ParkSize | null,
  categorie1Id: null as number | null,
  categorie2Id: null as number | null,
  categorie3Id: null as number | null,

  products: [] as ObservedProductInput[],
  otherProduct: "",
  brands: [] as ObservedBrandInput[],

  sdkPosition: null as SDKPosition | null,
  competitors: [] as { competitorId: number; presence?: PresenceLevel }[],
  opportunityDetected: null as boolean | null,
  oppProductId: null as string | null,
  oppPotential: null as OpportunityPotential | null,
  oppHorizon: null as OpportunityHorizon | null,
  oppAmount: "",
  oppCompetitorId: null as number | null,

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

  setActiviteObserveeId: (activiteObserveeId) =>
    set({
      activiteObserveeId,
      serviceDecoupe: null,
      chantierTypeId: null,
      chantierPhaseId: null,
      signPhoto: null,
      activitesIndustriellesIds: [],
      industrialOther: "",
      equipementIds: [],
      equipementQuantites: {},
    }),
  setServiceDecoupe: (serviceDecoupe) => set({ serviceDecoupe }),
  setChantierTypeId: (chantierTypeId) => set({ chantierTypeId }),
  setChantierPhaseId: (chantierPhaseId) => set({ chantierPhaseId }),
  setSignPhoto: (signPhoto) => set({ signPhoto }),
  toggleActiviteIndustrielle: (id) =>
    set((state) => {
      if (state.activitesIndustriellesIds.includes(id)) {
        return {
          activitesIndustriellesIds: state.activitesIndustriellesIds.filter(
            (a) => a !== id,
          ),
        };
      }
      return {
        activitesIndustriellesIds: [...state.activitesIndustriellesIds, id],
      };
    }),
  setIndustrialOther: (industrialOther) => set({ industrialOther }),
  toggleEquipement: (id) =>
    set((state) => {
      if (state.equipementIds.includes(id)) {
        const quantities = { ...state.equipementQuantites };
        delete quantities[String(id)];
        return {
          equipementIds: state.equipementIds.filter((e) => e !== id),
          equipementQuantites: quantities,
        };
      }
      return {
        equipementIds: [...state.equipementIds, id],
        equipementQuantites: { ...state.equipementQuantites, [String(id)]: 1 },
      };
    }),
  setEquipementQuantity: (id, quantity) =>
    set((state) => ({
      equipementQuantites: {
        ...state.equipementQuantites,
        [String(id)]: quantity,
      },
    })),
  clearEquipements: () => set({ equipementIds: [], equipementQuantites: {} }),
  setSiteSize: (siteSize) => set({ siteSize }),
  setCategorie1Id: (categorie1Id) => set({ categorie1Id }),
  setCategorie2Id: (categorie2Id) => set({ categorie2Id }),
  setCategorie3Id: (categorie3Id) => set({ categorie3Id }),

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
