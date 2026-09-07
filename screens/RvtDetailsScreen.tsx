import { getVisitById } from "@/api/visits.api";
import RvtPicturePreview from "@/components/RvtPicturePreview";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import {
  GPS_STATUS_LABELS,
  IndustrialSite,
  ResellerSite,
} from "@/types/rvt.types";
import { formatDuration, rvtPhotoUrl, syncStatusUi } from "@/utils/rvt-format";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RvtDetailsScreen() {
  const router = useRouter();
  const { user } = useSession();
  const canList = hasRapportVisitePermission(user, "LIST");
  const canUpdate = hasRapportVisitePermission(user, "UPDATE");
  const store = useCreateVisitStore();

  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["visits", "details", visitId],
    queryFn: () => getVisitById({ id: String(visitId) }),
    enabled: canList && Boolean(visitId),
  });

  const report = data ?? null;
  const status = useMemo(
    () => syncStatusUi(report?.syncStatus),
    [report?.syncStatus],
  );
  const photos = useMemo(() => {
    const list = [...(report?.photos ?? [])];
    const signPhoto = report?.constructionSite?.signPhoto;
    if (signPhoto?.remoteUrl) {
      list.unshift(signPhoto);
    }
    return list;
  }, [report]);

  const handleEdit = () => {
    if (!report) return;
    store.configureEdit({
      visitId: report.visitId || report.id,
      version: report.version,
      roundId: report.roundId,
      startedAt: report.startedAt,
    });
    store.hydrateFromReport({
      client: {
        id: Number(report.client?.id) || 0,
        societe: report.client?.name || "",
        ville: report.client?.city || "",
        telephone: "",
        adresse: "",
      },
      location: report.location,
      contactRole: report.contactRole,
      contactOther: report.contactOther ?? "",
      activityLevel: report.activityLevel,
      activiteObserveeId: report.activiteObservee?.id ?? null,
      serviceDecoupe: report.resellerSite?.offersCutting ?? null,
      chantierTypeId: report.constructionSite?.type?.id ?? null,
      chantierPhaseId: report.constructionSite?.progressPhase?.id ?? null,
      activitesIndustriellesIds:
        report.industrialSite?.activities?.map((a) => a.id) ?? [],
      industrialOther: report.industrialSite?.otherActivity ?? "",
      equipementIds: report.equipment?.map((e) => e.id) ?? [],
      equipementQuantites: report.equipmentQuantities ?? {},
      siteSize: report.siteSize,
      categorie1Id: report.categorie1?.id ?? null,
      categorie2Id: report.categorie2?.id ?? null,
      categorie3Id: report.categorie3?.id ?? null,
      products: (report.products ?? []).map((p) => ({
        lineId: p.lineId ?? "",
        productId: p.productId ?? "",
        presence: p.presence ?? undefined,
        details: p.details,
      })),
      otherProduct: report.otherProduct ?? "",
      brands: report.brands,
      sdkPosition: report.sdkPosition,
      competitors: report.competitors,
      opportunityDetected: report.opportunity?.detected ?? null,
      oppProductId: report.opportunity?.productId ?? null,
      oppPotential: report.opportunity?.potential ?? null,
      oppHorizon: report.opportunity?.horizon ?? null,
      oppAmount: report.opportunity?.estimatedAmount?.toString() ?? "",
      oppCompetitorId:
        report.opportunity?.competitorId != null
          ? Number(report.opportunity.competitorId)
          : null,
      results: report.results,
      orderSolo: report.orderQuantities?.solo?.toString() ?? "",
      orderSemiCombined: report.orderQuantities?.semiCombined?.toString() ?? "",
      nextAction: report.nextAction,
      nextActionDueAt: report.nextActionDueAt,
      note: report.note ?? "",
      existingPhotos: report.photos ?? [],
      existingSignPhoto: report.constructionSite?.signPhoto ?? null,
    });
    router.navigate("/rvt/create/client");
  };

  if (!canList) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <FontAwesome5 name="lock" size={34} color="#bbb" />
          <Text style={styles.centeredText}>
            {"Vous n'avez pas la permission de consulter ce rapport."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeCentered}>
        <FontAwesome5 name="spinner" size={30} color={PRIMARY} />
      </SafeAreaView>
    );
  }

  if (isError || !report) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <FontAwesome5 name="exclamation-circle" size={34} color="#bbb" />
          <Text style={styles.centeredText}>
            Impossible de charger les détails de ce rapport.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const products = report.products ?? [];
  const brands = report.brands ?? [];
  const competitors = report.competitors ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Client et visite" icon="building">
          <DetailRow
            icon="user"
            label="Client"
            value={report.client?.name || "-"}
          />
          <DetailRow
            icon="map-marker-alt"
            label="Ville"
            value={report.client?.city || "-"}
          />
          <DetailRow
            icon="barcode"
            label="Code"
            value={report.client?.code || "-"}
          />
          <DetailRow
            icon="id-badge"
            label="Contact"
            value={report.contactRole || "-"}
          />
          {report.contactOther ? (
            <DetailRow
              icon="comment"
              label="Contact"
              value={report.contactOther}
            />
          ) : null}
          <DetailRow
            icon="tachometer-alt"
            label="Activité"
            value={report.activityLevel || "-"}
          />
          <DetailRow
            icon="satellite"
            label="GPS"
            value={GPS_STATUS_LABELS[report.location?.status] ?? "-"}
          />
          <DetailRow
            icon="clock"
            label="Durée"
            value={formatDuration(report.durationSeconds)}
          />
          <DetailRow
            icon="calendar"
            label="Date"
            value={formatReportDate(report.completedAt)}
          />
          <DetailRow icon="sync" label="Sync" value={status.label} />
        </Section>

        <Section title="Profil terrain" icon="industry">
          <DetailRow
            icon="industry"
            label="Activité"
            value={report.activiteObservee?.libelle || "-"}
          />
          <DetailRow
            icon="vector-square"
            label="Taille"
            value={report.siteSize || "-"}
          />
          {report.resellerSite ? (
            <DetailRow
              icon="scissors"
              label="Découpe"
              value={resellerCuttingLabel(report.resellerSite)}
            />
          ) : null}
          {report.constructionSite ? (
            <>
              <DetailRow
                icon="hard-hat"
                label="Chantier"
                value={report.constructionSite.type?.libelle || "-"}
              />
              <DetailRow
                icon="chart-line"
                label="Phase"
                value={report.constructionSite.progressPhase?.libelle || "-"}
              />
            </>
          ) : null}
          {report.industrialSite ? (
            <DetailRow
              icon="industry"
              label="Industries"
              value={industrialLabel(report.industrialSite)}
            />
          ) : null}
          {report.equipment?.length ? (
            <DetailRow
              icon="wrench"
              label="Équipements"
              value={equipmentLabel(
                report.equipment,
                report.equipmentQuantities,
              )}
            />
          ) : null}
        </Section>

        <Section title="Marché — produits et marques" icon="boxes">
          {report.categorie1 ? (
            <DetailRow
              icon="tags"
              label="Catégorie 1"
              value={report.categorie1.designation ?? String(report.categorie1.id)}
            />
          ) : null}
          {report.categorie2 ? (
            <DetailRow
              icon="tags"
              label="Catégorie 2"
              value={report.categorie2.designation ?? String(report.categorie2.id)}
            />
          ) : null}
          {report.categorie3 ? (
            <DetailRow
              icon="tags"
              label="Catégorie 3"
              value={report.categorie3.designation ?? String(report.categorie3.id)}
            />
          ) : null}
          {products.length === 0 && brands.length === 0 ? (
            <Text style={styles.mutedText}>Aucun produit relevé.</Text>
          ) : (
            <>
              {products.map((product, index) => (
                <View
                  key={product.lineId ?? `product-${index}`}
                  style={styles.productBlock}
                >
                  <DetailRow
                    icon="box-open"
                    label="Produit"
                    value={product.label ?? product.productId ?? "-"}
                  />
                  <DetailRow
                    icon="percent"
                    label="Présence"
                    value={product.presence || "-"}
                  />
                  {product.details ? (
                    <DetailRow
                      icon="cog"
                      label="Détails"
                      value={productDetailsLabel(product.details)}
                    />
                  ) : null}
                </View>
              ))}
              {brands.map((brand, index) => (
                <DetailRow
                  key={brand.brandId ?? `brand-${index}`}
                  icon="trademark"
                  label="Marque"
                  value={`${brand.label ?? brand.brandId ?? "-"}${brand.presence ? ` (${brand.presence})` : ""}`}
                />
              ))}
            </>
          )}
          {report.otherProduct ? (
            <DetailRow icon="pen" label="Autre" value={report.otherProduct} />
          ) : null}
        </Section>

        <Section title="Concurrence et opportunité" icon="lightbulb">
          <DetailRow
            icon="chart-line"
            label="Position SDK"
            value={report.sdkPosition || "-"}
          />
          {competitors.map((competitor) => (
            <DetailRow
              key={competitor.competitorId}
              icon="users"
              label="Concurrent"
              value={`${competitor.label}${competitor.presence ? ` (${competitor.presence})` : ""}`}
            />
          ))}
          <DetailRow
            icon="lightbulb"
            label="Opportunité"
            value={
              report.opportunity?.detected == null
                ? "-"
                : report.opportunity.detected
                  ? "Oui"
                  : "Non"
            }
          />
          {report.opportunity?.detected ? (
            <>
              <DetailRow
                icon="box-open"
                label="Produit"
                value={
                  report.opportunity.productLabel ||
                  report.opportunity.productId ||
                  "-"
                }
              />
              <DetailRow
                icon="signal"
                label="Potentiel"
                value={report.opportunity.potential || "-"}
              />
              <DetailRow
                icon="clock"
                label="Horizon"
                value={report.opportunity.horizon || "-"}
              />
              {report.opportunity.estimatedAmount != null ? (
                <DetailRow
                  icon="money-bill"
                  label="Montant"
                  value={`${report.opportunity.estimatedAmount} DH`}
                />
              ) : null}
              {report.opportunity.competitor ? (
                <DetailRow
                  icon="users"
                  label="Concurrent"
                  value={report.opportunity.competitor}
                />
              ) : null}
            </>
          ) : null}
        </Section>

        <Section title="Conclusion et suivi" icon="check-circle">
          <DetailRow
            icon="tasks"
            label="Résultats"
            value={report.results?.join(", ") || "-"}
          />
          {report.orderQuantities ? (
            <>
              <DetailRow
                icon="cube"
                label="Solo"
                value={String(report.orderQuantities.solo)}
              />
              <DetailRow
                icon="cubes"
                label="Semi-combiné"
                value={String(report.orderQuantities.semiCombined)}
              />
            </>
          ) : null}
          <DetailRow
            icon="calendar-check"
            label="Action"
            value={report.nextAction || "-"}
          />
          {report.nextActionDueAt ? (
            <DetailRow
              icon="calendar"
              label="Échéance"
              value={formatReportDate(report.nextActionDueAt)}
            />
          ) : null}
          {report.note ? (
            <DetailRow icon="comment-dots" label="Note" value={report.note} />
          ) : null}
        </Section>

        {photos.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photos de la visite</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoRow}
            >
              {photos.map((photo, index) => {
                const uri = rvtPhotoUrl(photo);
                return (
                  <Pressable
                    key={photo.id ?? `sign-photo-${index}`}
                    onPress={() => uri && setPreviewUri(uri)}
                  >
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={styles.photoThumb}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.photoThumbLoading}>
                        <FontAwesome5
                          name="spinner"
                          size={16}
                          color="#64748b"
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {canUpdate ? (
          <Pressable onPress={handleEdit} style={styles.editButton}>
            <FontAwesome5 name="edit" size={14} color={PRIMARY} />
            <Text style={styles.editButtonText}>Modifier</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <RvtPicturePreview uri={previewUri} onClose={() => setPreviewUri(null)} />
    </SafeAreaView>
  );
}

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <FontAwesome5 name={icon as any} size={13} color={PRIMARY} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.detailRow}>
    <FontAwesome5
      name={icon as any}
      size={13}
      color={PRIMARY}
      style={styles.detailIcon}
    />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const formatReportDate = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const resellerCuttingLabel = (site: ResellerSite) => {
  if (site.offersCutting == null) return "-";
  return site.offersCutting ? "Oui" : "Non";
};

const industrialLabel = (site: NonNullable<IndustrialSite>) => {
  const parts = (site.activities ?? []).map((a) => a.libelle);
  if (site.otherActivity) parts.push(site.otherActivity);
  return parts.join(", ") || "-";
};

const equipmentLabel = (
  equipment: { id: number; libelle: string }[],
  quantities: Record<string, number> | undefined,
) =>
  (equipment ?? [])
    .map((eq) => {
      const qty = quantities?.[String(eq.id)];
      return qty != null ? `${eq.libelle} (×${qty})` : eq.libelle;
    })
    .join(", ") || "-";

const productDetailsLabel = (details: Record<string, string>) => {
  const keys: [string, string][] = [
    ["quality", "Qualité"],
    ["essence", "Essence"],
    ["decor", "Décor"],
    ["finish", "Finition"],
    ["thickness", "Épaisseur"],
    ["section", "Section"],
    ["dimensions", "Dimension"],
    ["quantity", "Qté"],
    ["price", "Prix"],
  ];
  return keys
    .filter(([k]) => details[k])
    .map(([k, label]) => `${label}: ${details[k]}`)
    .join(" · ");
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  safeCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fa",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  centeredText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 24,
    rowGap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  mutedText: {
    color: "#aaa",
    fontSize: 13,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  detailIcon: {
    width: 18,
    marginTop: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#888",
    width: 110,
  },
  detailValue: {
    fontSize: 13,
    color: "#222",
    flex: 1,
    flexWrap: "wrap",
  },
  productBlock: {
    marginBottom: 10,
  },
  photoRow: {
    columnGap: 8,
  },
  photoThumb: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  photoThumbLoading: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: PRIMARY + "18",
    gap: 6,
  },
  editButtonText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 14,
  },
});
