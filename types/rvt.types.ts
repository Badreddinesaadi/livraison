export type GPSStatus =
  | "GPS_VALIDATED"
  | "GPS_DENIED"
  | "GPS_UNAVAILABLE"
  | "GPS_TIMEOUT";

export type SyncStatus = "draft" | "pending_sync" | "synced" | "sync_error";

export type RoundStatus = "open" | "closed";

export type ActivityType =
  | "Menuiserie"
  | "Usine Meuble"
  | "Chantier BTP"
  | "Négoce";

export type ParkSize = "Petite" | "Moyenne" | "Grande";

export type MainCategory =
  | "BOIS"
  | "BOIS DUR"
  | "PANNEAUX"
  | "BTP"
  | "ACCESSOIRES";

export type ContactRole =
  | "Gérant"
  | "Acheteur"
  | "Commercial"
  | "Responsable production"
  | "Responsable chantier"
  | "Autre";

export type ObservedActivity = {
  id: number;
  designation: string;
  domaineId?: number;
};

export type ActivityLevel = "Faible" | "Moyen" | "Fort";

export type PresenceLevel = "Faible" | "Moyen" | "Important";

export type SDKPosition =
  | "Absent"
  | "Faible"
  | "Moyen"
  | "Important"
  | "Dominant";

export type OpportunityPotential =
  | "Petit"
  | "Moyen"
  | "Important"
  | "Très important";

export type OpportunityHorizon =
  | "Immédiat"
  | "< 1 mois"
  | "1 à 3 mois"
  | "> 3 mois";

export type VisitResult =
  | "Commande"
  | "Devis"
  | "Échantillon"
  | "Tarif"
  | "Relance"
  | "Prospection"
  | "Réclamation"
  | "RAS";

export type NextAction =
  | "Appeler"
  | "Envoyer prix"
  | "Envoyer devis"
  | "Envoyer échantillon"
  | "Faire offre"
  | "Revisiter"
  | "Aucune";

export type ErpClient = {
  id: number;
  societe: string;
  ville: string;
  telephone: string;
  adresse: string;
  commercial_nom?: string;
  categorie_client?: string;
  activite_nom?: string;
};

export type Client = {
  id: string;
  code?: string;
  name: string;
  city?: string;
  commercialId?: string;
  commercialName?: string;
  category?: string;
  activity?: ActivityType;
  parkSize?: ParkSize;
  active: boolean;
};

export type Location = {
  status: GPSStatus;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  capturedAt?: string;
  address?: string;
  city?: string;
  region?: string;
};

export type ActionDateOption = {
  id: string;
  label: string;
  days: number;
};

export type Marque = {
  id: number;
  designation: string;
  domaineId?: number;
};

export type ProductCategory1 = {
  id: number;
  designation: string;
  categorie2?: { id: number; designation: string }[];
};

export type ProductCategory2 = {
  id: number;
  designation: string;
  idCategorie1?: number | null;
  domaineId?: number;
  categorie3: { id: number; designation: string }[];
};

export type ProductCategory3 = {
  id: number;
  designation: string;
  idCategorie2: number;
  domaineId?: number;
};

export type ReferenceData = {
  contactRoles: ContactRole[];
  activityLevels: ActivityLevel[];
  observedActivities: ObservedActivity[];
  marques: Marque[];
  siteSizes: ParkSize[];
  presenceLevels: PresenceLevel[];
  sdkPositions: SDKPosition[];
  opportunityPotentials: OpportunityPotential[];
  opportunityHorizons: OpportunityHorizon[];
  visitResults: VisitResult[];
  nextActions: NextAction[];
  actionDateOptions: ActionDateOption[];
  productCategories: ProductCategory1[];
  productCategoriesLevel2: ProductCategory2[];
  productCategoriesLevel3: ProductCategory3[];
  productSuggestions: Record<string, string[]>;
  qualityTags: string[];
  allQualityOptions: string[];
  panelThicknesses: string[];
  panelDimensions: string[];
  panelDecors: string[];
  panelFinitions: string[];
  hardwoodEssences: string[];
  boisSections: string[];
  poutreH20Lengths: string[];
  madrierLengths: string[];
  madrierThicknesses: string[];
  btpCraneOptions: string[];
  constructionTypes: string[];
  constructionPhases: string[];
  industrialActivities: string[];
  equipmentByActivity: Record<string, string[]>;
  suppliersByCategory: Record<string, string[]>;
  competitors: string[];
};

export type ProductDetails = {
  quality?: string;
  essence?: string;
  decor?: string;
  finish?: string;
  thickness?: string;
  section?: string;
  quantity?: string;
  price?: string;
  dimensions?: string;
};

export type ObservedProductInput = {
  lineId: string;
  productId: string;
  category2?: string;
  presence?: PresenceLevel;
  details?: ProductDetails;
};

export type ObservedProduct = ObservedProductInput & {
  lineId: string;
  label: string;
  categoryId: MainCategory;
  categoryLabel: string;
  subcategoryId?: string;
  subcategoryLabel?: string;
};

export type ObservedBrandInput = {
  brandId: number;
  presence?: PresenceLevel;
};

export type ObservedBrand = {
  brandId: number;
  label: string;
  categoryId?: MainCategory;
  presence?: PresenceLevel;
};

export type ObservedCompetitorInput = {
  competitorId: string;
  presence?: PresenceLevel;
};

export type ObservedCompetitor = {
  competitorId: string;
  label: string;
  presence?: PresenceLevel;
};

export type OpportunityInput = {
  detected: boolean | null;
  productId?: string;
  potential?: OpportunityPotential;
  horizon?: OpportunityHorizon;
  estimatedAmount?: number;
  competitorId?: string;
};

export type Opportunity = OpportunityInput & {
  productLabel?: string;
  categoryId?: MainCategory;
  competitor?: string;
};

export type ConstructionSiteInput = {
  type?: string;
  progressPhase?: string;
  signPhotoId?: string;
};

export type ConstructionSite = ConstructionSiteInput & {
  signPhoto?: VisitPhoto;
};

export type IndustrialSite = {
  activities: string[];
  otherActivity?: string;
};

export type ResellerSite = {
  offersCutting: boolean | null;
};

export type OrderQuantities = {
  solo: number;
  semiCombined: number;
};

export type VisitPhoto = {
  id: string;
  name: string;
  contentType: string;
  size: number;
  capturedAt: string;
  remoteUrl?: string;
  thumbnailUrl?: string;
  processingStatus: "processing" | "ready" | "failed";
  errorMessage?: string;
};

export type VisitFields = {
  clientId?: number;
  startedAt?: string;
  completedAt?: string;
  location?: Location;
  contactRole?: ContactRole;
  contactOther?: string;
  activityLevel?: ActivityLevel;
  observedActivities?: number[];
  categorie1?: number;
  categorie2?: number;
  categorie3?: number;
  equipment?: string[];
  equipmentQuantities?: Record<string, number>;
  constructionSite?: ConstructionSiteInput;
  industrialSite?: IndustrialSite;
  resellerSite?: ResellerSite;
  siteSize?: ParkSize;
  products?: ObservedProductInput[];
  otherProduct?: string;
  brands?: ObservedBrandInput[];
  competitors?: ObservedCompetitorInput[];
  sdkPosition?: SDKPosition;
  opportunity?: OpportunityInput;
  results?: VisitResult[];
  orderQuantities?: OrderQuantities;
  nextAction?: NextAction;
  nextActionDueAt?: string;
  note?: string;
};

export type VisitCreate = VisitFields & {
  roundId: number;
  clientId: number;
  startedAt: string;
  location: Location;
  observedActivities: number[];
  opportunity: OpportunityInput;
  results: VisitResult[];
};

export type VisitPatch = VisitFields;

export type VisitReport = {
  id: string;
  visitId: string;
  version: number;
  roundId: string;
  commercialId: string;
  createdAt: string;
  updatedAt?: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  syncStatus: SyncStatus;
  idempotencyKey: string;
  client: Client;
  location: Location;
  contactRole?: ContactRole;
  contactOther?: string;
  activityLevel?: ActivityLevel;
  observedActivities: ObservedActivity[];
  equipment: string[];
  equipmentQuantities: Record<string, number>;
  constructionSite?: ConstructionSite;
  industrialSite?: IndustrialSite;
  resellerSite?: ResellerSite;
  siteSize?: ParkSize;
  products: ObservedProduct[];
  otherProduct?: string;
  brands: ObservedBrand[];
  competitors: ObservedCompetitor[];
  sdkPosition?: SDKPosition;
  opportunity: Opportunity;
  results: VisitResult[];
  orderQuantities?: OrderQuantities;
  nextAction?: NextAction;
  nextActionDueAt?: string;
  note?: string;
  photos: VisitPhoto[];
};

export type Round = {
  id: string;
  commercialId: string;
  startedAt: string;
  closedAt?: string;
  status: RoundStatus;
  visitCount: number;
  syncStatus: SyncStatus;
};

export type DashboardRanking = {
  label: string;
  value: number;
};

export type DashboardData = {
  totalReports: number;
  uniqueClients: number;
  orders: number;
  opportunities: number;
  pendingSync: number;
  soloQuantity: number;
  semiCombinedQuantity: number;
  orderRate: number;
  opportunityRate: number;
  averageDurationSeconds: number;
  activityCounts: Record<string, number>;
  resultRanking: DashboardRanking[];
  sdkPositionRanking: DashboardRanking[];
  productRanking: DashboardRanking[];
  competitorRanking: DashboardRanking[];
  cityRanking: DashboardRanking[];
};

export const GPS_STATUS_LABELS: Record<GPSStatus, string> = {
  GPS_VALIDATED: "Validée",
  GPS_DENIED: "Refusée",
  GPS_UNAVAILABLE: "Indisponible",
  GPS_TIMEOUT: "Délai dépassé",
};
