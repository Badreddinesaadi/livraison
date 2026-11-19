import {
  DevisPreparation,
  DevisProduit,
  DevisProduitLot,
  getDevisProduits,
  preparerDevisLot,
  preparerDevisProduit,
} from "@/api/preparation-devis.api";
import Loader from "@/components/Loader";
import { hasPreparationDevisPermission } from "@/constants/permissions";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { useListItemFromCache } from "@/hooks/use-list-item-from-cache";
import { useSession } from "@/stores/auth.store";
import { usePreparationDevisSheetStore } from "@/stores/preparation-devis.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const STATUT_STYLE: Record<string, { bg: string; text: string }> = (() => {
  const map: Record<string, { bg: string; text: string }> = {};

  return new Proxy(map, {
    get(target, key: string) {
      if (key in target) return target[key];
      const lower = key.toLowerCase();
      if (lower.includes("refus") || lower.includes("annul")) {
        return { bg: "#ef444422", text: "#ef4444" };
      }
      if (lower.includes("encours") || lower.includes("brouillon")) {
        return { bg: "#f59e0b22", text: "#f59e0b" };
      }
      if (
        lower.includes("valid") ||
        lower.includes("valider") ||
        lower.includes("prepar") ||
        lower.includes("livrer")
      ) {
        return { bg: SUCCESS + "22", text: SUCCESS };
      }
      return { bg: "#9ca3af22", text: "#9ca3af" };
    },
  }) as Record<string, { bg: string; text: string }>;
})();

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

const PreparerBadge = ({
  prepared,
  onPress,
}: {
  prepared: boolean;
  onPress?: () => void;
}) => {
  const badge = (
    <View
      style={[
        styles.badge,
        prepared ? styles.badgePrepared : styles.badgePending,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          prepared ? styles.badgeTextPrepared : styles.badgeTextPending,
        ]}
      >
        {prepared ? "Préparé" : "Non préparé"}
      </Text>
    </View>
  );

  if (!prepared && onPress) {
    return <Pressable onPress={onPress}>{badge}</Pressable>;
  }

  return badge;
};

const LotItem = ({
  lot,
  onPreparerLot,
  onReplaceLot,
}: {
  lot: DevisProduitLot;
  onPreparerLot?: () => void;
  onReplaceLot?: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <View style={styles.lotCard}>
      <Pressable onPress={toggle} style={styles.lotHeader}>
        <FontAwesome5 name="barcode" size={12} color={PRIMARY} />
        <Text style={styles.lotCode} numberOfLines={1}>
          {lot.code}
        </Text>
        <PreparerBadge prepared={lot.preparation} onPress={onPreparerLot} />
        {onReplaceLot && (
          <Pressable
            onPress={onReplaceLot}
            hitSlop={6}
            style={styles.replaceButton}
          >
            <FontAwesome5 name="exchange-alt" size={11} color={PRIMARY} />
            {/* <Text style={{ fontSize: 11, fontWeight: "600", color: PRIMARY }}>
              Remplacer
            </Text> */}
          </Pressable>
        )}
        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={10}
          color="#bbb"
          style={styles.chevron}
        />
      </Pressable>
      {expanded && (
        <View style={styles.lotDetails}>
          <DetailRow icon="barcode" label="Code lot" value={lot.code} />
          <DetailRow icon="cube" label="Qté" value={String(lot.qte ?? "-")} />
          <DetailRow
            icon="boxes"
            label="Nbre PCE"
            value={String(lot.nbrePce ?? "-")}
          />
          <DetailRow icon="ruler" label="Long" value={lot.long || "-"} />
          {lot.dateEntree && (
            <DetailRow
              icon="calendar"
              label="Date d'entrée"
              value={formatDateTime(lot.dateEntree)}
            />
          )}
          <DetailRow
            icon="warehouse"
            label="Dépôt"
            value={lot.depot?.name || "-"}
          />
          {lot.documentLivraison ? (
            <DetailRow
              icon="truck"
              label="Document livraison"
              value={lot.documentLivraison}
            />
          ) : null}
          <DetailRow
            icon="user-check"
            label="Créé par"
            value={lot.createdby?.name || "-"}
          />
          {lot.observ ? (
            <DetailRow icon="comment" label="Observation" value={lot.observ} />
          ) : null}
        </View>
      )}
    </View>
  );
};

const ProductCard = ({
  product,
  canUpdate,
  onReplaceLot,
  onPreparerProduct,
  onPreparerLot,
}: {
  product: DevisProduit;
  canUpdate: boolean;
  onReplaceLot?: (lot: DevisProduitLot) => void;
  onPreparerProduct?: () => void;
  onPreparerLot?: (lot: DevisProduitLot) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const lotsCount = product.lots?.length ?? 0;

  return (
    <View style={styles.productCard}>
      <Pressable onPress={toggle} style={styles.productHeader}>
        <View style={styles.productIconBubble}>
          <FontAwesome5 name="box" size={14} color={PRIMARY} />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productSubtitle}>
            Stock : {product.stock} · Résa : {product.qteResa} {product.unite}
          </Text>
        </View>
        <PreparerBadge
          prepared={product.preparation}
          onPress={canUpdate ? onPreparerProduct : undefined}
        />
        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={12}
          color="#bbb"
          style={styles.chevron}
        />
      </Pressable>

      {lotsCount > 0 && (
        <View style={styles.lotsSection}>
          <View style={styles.lotsHeader}>
            <FontAwesome5 name="th-list" size={13} color={PRIMARY} />
            <Text style={styles.lotsTitle}>Lots ({lotsCount})</Text>
          </View>
          {product.lots.map((lot, idx) => (
            <LotItem
              key={`${lot.id}-${idx}`}
              lot={lot}
              onPreparerLot={
                canUpdate && onPreparerLot
                  ? () => onPreparerLot(lot)
                  : undefined
              }
              onReplaceLot={
                canUpdate &&
                onReplaceLot &&
                (lot.modifiable ?? !lot.preparation)
                  ? () => onReplaceLot(lot)
                  : undefined
              }
            />
          ))}
        </View>
      )}

      {expanded && (
        <View style={styles.lotsSection}>
          <DetailRow icon="box" label="Produit" value={product.name || "-"} />
          <DetailRow
            icon="warehouse"
            label="Stock"
            value={String(product.stock ?? "-")}
          />
          <DetailRow
            icon="bookmark"
            label="Qté résa"
            value={String(product.qteResa ?? "-")}
          />
          <DetailRow
            icon="shopping-cart"
            label="Qté cmdé"
            value={String(product.qtecmde ?? "-")}
          />
          <DetailRow
            icon="ruler-combined"
            label="Unité"
            value={product.unite || "-"}
          />
          <DetailRow
            icon="hourglass-half"
            label="Reste à livrer"
            value={String(product.restealivre ?? "-")}
          />
        </View>
      )}
    </View>
  );
};

export const PreparationDevisDetailsScreen = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const canView = hasPreparationDevisPermission(user, "LIST");
  const canUpdate = hasPreparationDevisPermission(user, "UPDATE");

  const openPreparerConfirmSheet = usePreparationDevisSheetStore(
    (s) => s.openPreparerConfirmSheet,
  );
  const finishPreparer = usePreparationDevisSheetStore((s) => s.finishPreparer);
  const openReplaceLotsSheet = usePreparationDevisSheetStore(
    (s) => s.openReplaceLotsSheet,
  );

  const { devisId } = useLocalSearchParams<{ devisId: string }>();
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["preparation-devis", "produits", devisId],
    queryFn: () => getDevisProduits({ idDevis: String(devisId) }),
    enabled: canView && Boolean(devisId),
  });

  const devisItem = useListItemFromCache<DevisPreparation>(
    ["preparation-devis", "list"],
    devisId,
  );

  const products = productsData ?? [];
  const statutStyle = devisItem
    ? (STATUT_STYLE[devisItem.statut] ?? {
        bg: "#9ca3af18",
        text: "#9ca3af",
      })
    : { bg: "#9ca3af18", text: "#9ca3af" };
  const canPrepare = canUpdate && devisItem?.statut === "valider";

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["preparation-devis", "produits"],
    });
    queryClient.invalidateQueries({ queryKey: ["preparation-devis", "list"] });
  };

  const handlePreparerProduct = (product: DevisProduit) => {
    if (!canPrepare) return;
    openPreparerConfirmSheet({
      type: "preparer_produit",
      label: product.name,
      request: {
        type: "preparer_produit",
        idDevis: Number(devisId),
        idProduit: product.id,
      },
      handler: async (request) => {
        try {
          await preparerDevisProduit(request as any);
          invalidate();
          Toast.show({
            type: "success",
            text1: "Succès",
            text2: "Le produit a été préparé.",
          });
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: "Échec",
            text2: error?.message || "Impossible de préparer le produit.",
          });
        }
        finishPreparer();
      },
    });
  };

  const handlePreparerLot = (product: DevisProduit, lot: DevisProduitLot) => {
    if (!canPrepare) return;
    openPreparerConfirmSheet({
      type: "preparer_lot",
      label: lot.code,
      request: {
        type: "preparer_lot",
        idDevis: Number(devisId),
        idProduit: product.id,
        idLot: lot.id,
      },
      handler: async (request) => {
        try {
          await preparerDevisLot(request as any);
          invalidate();
          Toast.show({
            type: "success",
            text1: "Succès",
            text2: "Le lot a été préparé.",
          });
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: "Échec",
            text2: error?.message || "Impossible de préparer le lot.",
          });
        }
        finishPreparer();
      },
    });
  };

  const handleReplaceLot = (product: DevisProduit, lot: DevisProduitLot) => {
    if (!canPrepare) return;
    openReplaceLotsSheet({
      idDevis: Number(devisId),
      idProduit: product.id,
      productName: product.name,
      currentLot: lot,
    });
  };

  if (!canView) {
    return (
      <SafeAreaView style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>
          Vous n&apos;avez pas la permission de consulter ce devis.
        </Text>
      </SafeAreaView>
    );
  }

  if (productsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {devisItem && (
          <View style={styles.infoCard}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{devisItem.document}</Text>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: statutStyle.bg },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: statutStyle.text }]}
                >
                  {devisItem.statutLabel || devisItem.statut}
                </Text>
              </View>
            </View>

            <DetailRow
              icon="user"
              label="Client"
              value={devisItem.client?.name || "-"}
            />
            <DetailRow
              icon="map-marker-alt"
              label="Ville"
              value={devisItem.ville?.name || "-"}
            />
            <DetailRow
              icon="truck"
              label="Mode livr."
              value={devisItem.modeLivraison || "-"}
            />
            <DetailRow
              icon="user-tie"
              label="Commercial"
              value={devisItem.commercial?.name || "-"}
            />
            <DetailRow
              icon="list-ol"
              label="Nb lignes"
              value={String(devisItem.nbLignes ?? 0)}
            />
            <DetailRow
              icon="calendar"
              label="Date"
              value={formatDateTime(devisItem.date)}
            />
            <DetailRow
              icon="user-check"
              label="Créé par"
              value={devisItem.createdby?.name || "-"}
            />
          </View>
        )}

        {devisItem && devisItem.statut !== "valider" && (
          <View style={styles.warningBox}>
            <FontAwesome5 name="info-circle" size={14} color="#b45309" />
            <Text style={styles.warningText}>
              Ce devis n&apos;est pas validé. La préparation des produits et des
              lots n&apos;est possible que pour un devis validé.
            </Text>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <FontAwesome5 name="boxes" size={16} color={PRIMARY} />
          <Text style={styles.sectionTitle}>Produits ({products.length})</Text>
        </View>

        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canUpdate={canPrepare}
              onReplaceLot={(lot) => handleReplaceLot(product, lot)}
              onPreparerProduct={() => handlePreparerProduct(product)}
              onPreparerLot={(lot) => handlePreparerLot(product, lot)}
            />
          ))
        ) : (
          <View style={styles.emptyBox}>
            <FontAwesome5 name="box-open" size={32} color="#ddd" />
            <Text style={styles.emptyText}>Aucun produit</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  lockScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f7f8fa",
  },
  lockText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  listContent: {
    padding: 14,
    paddingBottom: 30,
  },
  infoCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f59e0b55",
    backgroundColor: "#f59e0b14",
    marginBottom: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#92400e",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    flex: 1,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
  },
  emptyText: {
    color: "#ccc",
    marginTop: 10,
    fontSize: 14,
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgePrepared: {
    backgroundColor: SUCCESS + "18",
  },
  badgePending: {
    backgroundColor: "#f59e0b18",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextPrepared: {
    color: SUCCESS,
  },
  badgeTextPending: {
    color: "#f59e0b",
  },
  lotCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 6,
    overflow: "hidden",
  },
  lotHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fafbfc",
  },
  lotCode: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
    marginLeft: 8,
  },
  replaceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: PRIMARY + "14",
    marginLeft: 6,
  },
  chevron: {
    marginLeft: 8,
  },
  lotDetails: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#efefef",
    overflow: "hidden",
    marginBottom: 10,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  productIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY + "18",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  productSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  lotsSection: {
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  lotsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  lotsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a2e",
  },
});
