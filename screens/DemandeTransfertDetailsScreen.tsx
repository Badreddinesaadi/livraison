import {
  DemandeTransfert,
  DemandeTransfertLot,
  DemandeTransfertProduct,
  changeDTStatut,
  deleteDemandeTransfert,
  deleteProductFromDT,
  getDemandeTransfertDetails,
  preparerDemandeTransfert,
} from "@/api/demande-transfert.api";
import Loader from "@/components/Loader";
import { hasDemandeTransfertPermission } from "@/constants/permissions";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { useListItemFromCache } from "@/hooks/use-list-item-from-cache";
import { useSession } from "@/stores/auth.store";
import { useDemandeTransfertSheetStore } from "@/stores/demande-transfert.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
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
      if (
        lower.includes("valid") ||
        lower.includes("valider") ||
        lower.includes("terminer")
      ) {
        return { bg: SUCCESS + "22", text: SUCCESS };
      }
      if (lower.includes("brouillon") || lower.includes("encours")) {
        return { bg: "#f59e0b22", text: "#f59e0b" };
      }
      if (lower.includes("refus") || lower.includes("annul")) {
        return { bg: "#ef444422", text: "#ef4444" };
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
  preparer,
  onPress,
}: {
  preparer: string;
  onPress?: () => void;
}) => {
  const isOui = preparer.toLowerCase() === "oui";
  const badge = (
    <View
      style={[
        styles.badge,
        isOui ? styles.badgePrepared : styles.badgePending,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isOui ? styles.badgeTextPrepared : styles.badgeTextPending,
        ]}
      >
        {isOui ? "Préparé" : "Non préparé"}
      </Text>
    </View>
  );

  if (!isOui && onPress) {
    return <Pressable onPress={onPress}>{badge}</Pressable>;
  }

  return badge;
};

const LotItem = ({
  lot,
  onPreparerLot,
  onReplaceLot,
}: {
  lot: DemandeTransfertLot;
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
          {lot.Lot}
        </Text>
        <PreparerBadge preparer={lot.preparer} onPress={onPreparerLot} />
        {onReplaceLot && (
          <Pressable
            onPress={onReplaceLot}
            hitSlop={6}
            style={styles.replaceButton}
          >
            <FontAwesome5 name="exchange-alt" size={11} color={PRIMARY} />
            <Text style={styles.replaceText}>Remplacer</Text>
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
          <LotDetailRow icon="barcode" label="Code lot" value={lot.Lot} />
          <LotDetailRow
            icon="history"
            label="lot ancien"
            value={lot.old_lot.length > 0 ? lot.old_lot : "--"}
          />
          <LotDetailRow icon="cube" label="Qte" value={lot.qte} />
          {lot.nbre_pce && (
            <LotDetailRow icon="boxes" label="Nbre PCE" value={lot.nbre_pce} />
          )}
          {lot.long && (
            <LotDetailRow icon="ruler" label="Long" value={lot.long} />
          )}
          {lot.date_entree && (
            <LotDetailRow
              icon="calendar"
              label="Date d'entrée"
              value={formatDateTime(lot.date_entree)}
            />
          )}
          {lot.depotName && (
            <LotDetailRow
              icon="warehouse"
              label="Dépôt"
              value={lot.depotName}
            />
          )}
        </View>
      )}
    </View>
  );
};

const LotDetailRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.lotDetailRow}>
    <FontAwesome5
      name={icon as any}
      size={11}
      color={PRIMARY}
      style={styles.lotDetailIcon}
    />
    <Text style={styles.lotDetailLabel}>{label}</Text>
    <Text style={styles.lotDetailValue}>{value}</Text>
  </View>
);

const ProductCard = ({
  product,
  canDelete,
  canUpdate,
  onDeleteProduct,
  onAddLot,
  onPreparerProduct,
  onPreparerLot,
  onReplaceLot,
}: {
  product: DemandeTransfertProduct;
  canDelete: boolean;
  canUpdate: boolean;
  onDeleteProduct?: () => void;
  onAddLot?: () => void;
  onPreparerProduct?: () => void;
  onPreparerLot?: (lot: DemandeTransfertLot) => void;
  onReplaceLot?: (lot: DemandeTransfertLot) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const lotsCount = product.lots?.length ?? 0;
  const isProductPrepared = (product.preparer ?? "").toLowerCase() === "oui";

  return (
    <View style={styles.productCard}>
      <Pressable onPress={toggle} style={styles.productHeader}>
        <View style={styles.productIconBubble}>
          <FontAwesome5 name="box" size={14} color={PRIMARY} />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.produit}
          </Text>
          <Text style={styles.productSubtitle}>
            {product.nbrFDX} FDX · {product.Qte} {product.unite_v}
          </Text>
        </View>
        <PreparerBadge
          preparer={product.preparer}
          onPress={onPreparerProduct}
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
              key={`${lot.idItem}-${lot.Lot}-${idx}`}
              lot={lot}
              onPreparerLot={
                onPreparerLot ? () => onPreparerLot(lot) : undefined
              }
              onReplaceLot={
                onReplaceLot &&
                !isProductPrepared &&
                (lot.preparer ?? "").toLowerCase() !== "oui"
                  ? () => onReplaceLot(lot)
                  : undefined
              }
            />
          ))}
        </View>
      )}

      {expanded && (
        <View style={styles.lotsSection}>
          <DetailRow
            icon="box"
            label="Produit"
            value={product.produit || "-"}
          />
          <DetailRow
            icon="layer-group"
            label="Nbr FDX"
            value={product.nbrFDX || "-"}
          />
          <DetailRow
            icon="sort-amount-up"
            label="Quantité"
            value={product.Qte || "-"}
          />
          <DetailRow
            icon="ruler-combined"
            label="Unité"
            value={product.unite_v || "-"}
          />
        </View>
      )}

      {(canDelete || canUpdate) && !isProductPrepared && (
        <View style={styles.actionsRow}>
          {canUpdate && onAddLot && (
            <Pressable onPress={onAddLot} style={styles.addLotButton}>
              <FontAwesome5 name="plus" size={14} color={PRIMARY} />
              <Text style={styles.addLotText}>Ajouter un lot</Text>
            </Pressable>
          )}
          {canDelete && onDeleteProduct && (
            <Pressable
              onPress={onDeleteProduct}
              style={styles.deleteProductButton}
            >
              <FontAwesome5 name="trash" size={14} color="#ef4444" />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

export const DemandeTransfertDetailsScreen = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const canView = hasDemandeTransfertPermission(user, "LIST");
  const canCreate = hasDemandeTransfertPermission(user, "CREATE");
  const canUpdate = hasDemandeTransfertPermission(user, "UPDATE");
  const canDelete = hasDemandeTransfertPermission(user, "DELETE");
  const openAddProductSheet = useDemandeTransfertSheetStore(
    (s) => s.openAddProductSheet,
  );
  const openDeleteProductConfirmSheet = useDemandeTransfertSheetStore(
    (s) => s.openDeleteProductConfirmSheet,
  );
  const finishDeleteProduct = useDemandeTransfertSheetStore(
    (s) => s.finishDeleteProduct,
  );
  const openAddLotSheet = useDemandeTransfertSheetStore(
    (s) => s.openAddLotSheet,
  );
  const openReplaceLotSheet = useDemandeTransfertSheetStore(
    (s) => s.openReplaceLotSheet,
  );
  const openPreparerConfirmSheet = useDemandeTransfertSheetStore(
    (s) => s.openPreparerConfirmSheet,
  );
  const finishPreparer = useDemandeTransfertSheetStore((s) => s.finishPreparer);
  const openStatutSelectorSheet = useDemandeTransfertSheetStore(
    (s) => s.openStatutSelectorSheet,
  );
  const openDeleteDTConfirmSheet = useDemandeTransfertSheetStore(
    (s) => s.openDeleteDTConfirmSheet,
  );
  const finishDeleteDT = useDemandeTransfertSheetStore((s) => s.finishDeleteDT);
  const closeSheet = useDemandeTransfertSheetStore((s) => s.closeSheet);
  const { demandeTransfertId } = useLocalSearchParams<{
    demandeTransfertId: string;
  }>();

  const { data: detailsData, isLoading: detailsLoading } = useQuery({
    queryKey: ["demande-transferts", "details", demandeTransfertId],
    queryFn: () =>
      getDemandeTransfertDetails({ id: String(demandeTransfertId) }),
    enabled: canView && Boolean(demandeTransfertId),
  });

  const transfertItem = useListItemFromCache<DemandeTransfert>(
    ["demande-transferts", "list"],
    demandeTransfertId,
  );

  const normalizedStatut = (transfertItem?.statut ?? "").trim().toLowerCase();
  const isBrouillon = normalizedStatut === "brouillon";
  const isEncours = normalizedStatut === "encours";
  const isEnvoye = normalizedStatut === "envoye";
  const isPreparationStatut = isEncours || isEnvoye;
  const canPrepare = canUpdate && isPreparationStatut;
  const canAddProducts = canCreate && isBrouillon;
  const canAddLots = canUpdate && isBrouillon;
  const canReplaceLots = canUpdate && (isBrouillon || isEncours || isEnvoye);

  const products = detailsData?.details ?? [];
  const statutStyle = transfertItem
    ? (STATUT_STYLE[transfertItem.statut] ?? {
        bg: "#9ca3af22",
        text: "#9ca3af",
      })
    : { bg: "#9ca3af22", text: "#9ca3af" };

  const handleAddProduct = () => {
    if (!canAddProducts) return;
    openAddProductSheet({
      idDT: Number(demandeTransfertId),
    });
  };

  const handleDeleteProduct = (product: DemandeTransfertProduct) => {
    openDeleteProductConfirmSheet({
      productDetailId: product.id,
      productName: product.produit,
      handler: async (productDetailId: string) => {
        try {
          await deleteProductFromDT({ type: "detail", id: productDetailId });
          queryClient.invalidateQueries({
            queryKey: ["demande-transferts", "details"],
          });
          queryClient.invalidateQueries({
            queryKey: ["demande-transferts", "list"],
          });
        } catch {}
        finishDeleteProduct();
      },
    });
  };

  const handleAddLot = (product: DemandeTransfertProduct) => {
    if (!canAddLots) return;
    if ((product.preparer ?? "").toLowerCase() === "oui") return;

    openAddLotSheet({
      idDT: Number(demandeTransfertId),
      idProduit: product.idProduit,
      productDetailId: product.id,
      productName: product.produit,
    });
  };

  const handleReplaceLot = (
    product: DemandeTransfertProduct,
    lot: DemandeTransfertLot,
  ) => {
    if (!canReplaceLots) return;
    if ((product.preparer ?? "").toLowerCase() === "oui") return;
    if ((lot.preparer ?? "").toLowerCase() === "oui") return;

    openReplaceLotSheet({
      idDT: Number(demandeTransfertId),
      idProduit: product.idProduit,
      productDetailId: product.id,
      productName: product.produit,
      currentLot: lot,
    });
  };

  const handlePreparerProduct = (product: DemandeTransfertProduct) => {
    if (!canPrepare) return;
    openPreparerConfirmSheet({
      type: "preparer_produit",
      label: product.produit,
      request: { type: "preparer_produit", id: product.id },
      handler: async (request) => {
        try {
          await preparerDemandeTransfert(request);
          queryClient.invalidateQueries({
            queryKey: ["demande-transferts", "details"],
          });
          queryClient.invalidateQueries({
            queryKey: ["demande-transferts", "list"],
          });
        } catch {}
        finishPreparer();
      },
    });
  };

  const handlePreparerLot = (lot: DemandeTransfertLot) => {
    if (!canPrepare) return;
    openPreparerConfirmSheet({
      type: "preparer_lot",
      label: lot.Lot,
      request: {
        type: "preparer_lot",
        idItem: lot.idItem,
        idProduit: lot.idProduit,
        Lot: lot.Lot,
      },
      handler: async (request) => {
        try {
          await preparerDemandeTransfert(request);
          queryClient.invalidateQueries({
            queryKey: ["demande-transferts", "details"],
          });
          queryClient.invalidateQueries({
            queryKey: ["demande-transferts", "list"],
          });
        } catch {}
        finishPreparer();
      },
    });
  };

  const handleChangeStatut = () => {
    if (!transfertItem || !canUpdate) return;
    openStatutSelectorSheet({
      idDT: Number(demandeTransfertId),
      currentStatut: transfertItem.statut,
      onSelect: async (statut) => {
        closeSheet();
        try {
          await changeDTStatut({
            id: Number(demandeTransfertId),
            statut,
          });
          queryClient.invalidateQueries({
            queryKey: ["demande-transferts", "details"],
          });
          queryClient.invalidateQueries({
            queryKey: ["demande-transferts", "list"],
          });
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: "Échec",
            text2: error.message || "Impossible de changer le statut.",
          });
        }
      },
    });
  };

  const handleDeleteDT = () => {
    if (!transfertItem || !canDelete) return;
    openDeleteDTConfirmSheet({
      idDT: Number(demandeTransfertId),
      reference: transfertItem.reference,
      handler: async () => {
        try {
          await deleteDemandeTransfert({
            id: Number(demandeTransfertId),
          });
          queryClient.invalidateQueries({
            queryKey: ["demande-transferts"],
          });
          router.back();
        } catch (error: any) {
          Toast.show({
            type: "error",
            text1: "Échec",
            text2: error.message || "Impossible de supprimer la demande.",
          });
        }
        finishDeleteDT();
      },
    });
  };

  const handleEditDT = () => {
    if (!transfertItem || !canUpdate) return;
    router.push(
      `/(app)/(drawer)/(stack)/demande-transferts/edit/${demandeTransfertId}` as any,
    );
  };

  if (!canView) {
    return (
      <SafeAreaView style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>
          Vous n&apos;avez pas la permission de consulter cette demande.
        </Text>
      </SafeAreaView>
    );
  }

  if (detailsLoading) {
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
        {transfertItem && (
          <View style={styles.infoCard}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{transfertItem.reference}</Text>
              {canUpdate ? (
                <Pressable onPress={handleChangeStatut}>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: statutStyle.bg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statutStyle.text }]}
                    >
                      {transfertItem.statut}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: statutStyle.bg },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statutStyle.text }]}
                  >
                    {transfertItem.statut}
                  </Text>
                </View>
              )}
            </View>

            <DetailRow
              icon="warehouse"
              label="Dépôt source"
              value={
                transfertItem.depot_source
                  ? `${transfertItem.depot_source}`
                  : `ID ${transfertItem.idDepotSource}`
              }
            />
            <DetailRow
              icon="warehouse"
              label="Dépôt dest."
              value={
                transfertItem.depot_destination
                  ? `${transfertItem.depot_destination}`
                  : `ID ${transfertItem.idDepotDestination}`
              }
            />
            <DetailRow
              icon="truck"
              label="Transporteur"
              value={transfertItem.transporteur || "-"}
            />
            <DetailRow
              icon="hashtag"
              label="Matricule"
              value={transfertItem.matricule || "-"}
            />
            <DetailRow
              icon="barcode"
              label="DUM"
              value={transfertItem.dum || "-"}
            />
            <DetailRow
              icon="calendar"
              label="Date"
              value={formatDateTime(transfertItem.date)}
            />
            {transfertItem.observation && (
              <DetailRow
                icon="comment"
                label="Observation"
                value={transfertItem.observation}
              />
            )}
            <DetailRow
              icon="user-check"
              label="Créé par"
              value={transfertItem.createur || "-"}
            />
          </View>
        )}

        {(canUpdate || canDelete) && transfertItem && (
          <View style={styles.actionRow}>
            {canUpdate && (
              <Pressable onPress={handleEditDT} style={styles.editButton}>
                <FontAwesome5 name="edit" size={14} color={PRIMARY} />
                <Text style={styles.editText}>Modifier</Text>
              </Pressable>
            )}
            {canDelete && (
              <Pressable onPress={handleDeleteDT} style={styles.deleteButton}>
                <FontAwesome5 name="trash" size={16} color="#ef4444" />
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <FontAwesome5 name="boxes" size={16} color={PRIMARY} />
          <Text style={styles.sectionTitle}>Produits ({products.length})</Text>
          {canAddProducts && (
            <Pressable onPress={handleAddProduct} style={styles.addProductButton}>
              <FontAwesome5 name="plus" size={12} color="#fff" />
              <Text style={styles.addProductText}>Ajouter</Text>
            </Pressable>
          )}
        </View>

        {transfertItem && !isPreparationStatut && (
          <View style={styles.warningBox}>
            <FontAwesome5 name="info-circle" size={14} color="#92400e" />
            <Text style={styles.warningText}>
              La préparation est disponible uniquement lorsque la demande est «
              Encours » ou « Envoyé ».
            </Text>
          </View>
        )}

        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canDelete={canDelete}
              canUpdate={canUpdate}
              onDeleteProduct={() => handleDeleteProduct(product)}
              onAddLot={canAddLots ? () => handleAddLot(product) : undefined}
              onPreparerProduct={
                canPrepare ? () => handlePreparerProduct(product) : undefined
              }
              onPreparerLot={
                canPrepare ? (lot) => handlePreparerLot(lot) : undefined
              }
              onReplaceLot={
                canReplaceLots
                  ? (lot) => handleReplaceLot(product, lot)
                  : undefined
              }
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
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: PRIMARY + "18",
    gap: 6,
  },
  editText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    width: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#ef444412",
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
  addProductButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: PRIMARY,
  },
  addProductText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: PRIMARY + "14",
    marginLeft: 6,
  },
  replaceText: {
    fontSize: 11,
    fontWeight: "600",
    color: PRIMARY,
  },
  chevron: {
    marginLeft: 8,
  },
  lotDetails: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lotDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  lotDetailIcon: {
    width: 14,
    marginTop: 1,
  },
  lotDetailLabel: {
    fontSize: 12,
    color: "#999",
    width: 80,
  },
  lotDetailValue: {
    fontSize: 12,
    color: "#333",
    flex: 1,
    flexWrap: "wrap",
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
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
  },
  addLotButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY + "18",
    gap: 6,
  },
  addLotText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 13,
  },
  deleteProductButton: {
    width: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#ef444412",
  },
});
