import {
  DemandeTransfertProduct,
  DemandeTransfertLot,
  changeDTStatut,
  deleteProductFromDT,
  deleteDemandeTransfert,
  getDemandeTransfertDetails,
  listDemandeTransfert,
  preparerDemandeTransfert,
} from "@/api/demande-transfert.api";
import Loader from "@/components/Loader";
import { hasDemandeTransfertPermission } from "@/constants/permissions";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { useDemandeTransfertSheetStore } from "@/stores/demande-transfert.store";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
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
  <View
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
    }}
  >
    <FontAwesome5
      name={icon as any}
      size={13}
      color={PRIMARY}
      style={{ width: 18, marginTop: 1 }}
    />
    <Text style={{ fontSize: 13, color: "#888", width: 110 }}>{label}</Text>
    <Text style={{ fontSize: 13, color: "#222", flex: 1, flexWrap: "wrap" }}>
      {value}
    </Text>
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
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: isOui ? SUCCESS + "18" : "#f59e0b18",
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: isOui ? SUCCESS : "#f59e0b",
        }}
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
}: {
  lot: DemandeTransfertLot;
  onPreparerLot?: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 8,
        marginBottom: 6,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={toggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 12,
          backgroundColor: "#fafbfc",
        }}
      >
        <FontAwesome5 name="barcode" size={12} color={PRIMARY} />
        <Text
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: "600",
            color: "#1a1a2e",
            marginLeft: 8,
          }}
          numberOfLines={1}
        >
          {lot.Lot}
        </Text>
        <PreparerBadge preparer={lot.preparer} onPress={onPreparerLot} />
        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={10}
          color="#bbb"
          style={{ marginLeft: 8 }}
        />
      </Pressable>
      {expanded && (
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <LotDetailRow icon="barcode" label="Code lot" value={lot.Lot} />
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
            <LotDetailRow icon="warehouse" label="Dépôt" value={lot.depotName} />
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
  <View
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 4,
    }}
  >
    <FontAwesome5
      name={icon as any}
      size={11}
      color={PRIMARY}
      style={{ width: 14, marginTop: 1 }}
    />
    <Text style={{ fontSize: 12, color: "#999", width: 80 }}>{label}</Text>
    <Text style={{ fontSize: 12, color: "#333", flex: 1, flexWrap: "wrap" }}>
      {value}
    </Text>
  </View>
);

const ProductCard = ({
  product,
  canDelete,
  canUpdate,
  onDeleteProduct,
  onManageLots,
  onPreparerProduct,
  onPreparerLot,
}: {
  product: DemandeTransfertProduct;
  canDelete: boolean;
  canUpdate: boolean;
  onDeleteProduct?: () => void;
  onManageLots?: () => void;
  onPreparerProduct?: () => void;
  onPreparerLot?: (lot: DemandeTransfertLot) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const lotsCount = product.lots?.length ?? 0;
  const isProductPrepared = (product.preparer ?? "").toLowerCase() === "oui";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#efefef",
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <Pressable
        onPress={toggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: PRIMARY + "18",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <FontAwesome5 name="box" size={14} color={PRIMARY} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 13, fontWeight: "700", color: "#1a1a2e" }}
            numberOfLines={2}
          >
            {product.produit}
          </Text>
          <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            {product.nbrFDX} FDX · {product.Qte} {product.unite_v}
          </Text>
        </View>
        <PreparerBadge preparer={product.preparer} onPress={onPreparerProduct} />
        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={12}
          color="#bbb"
          style={{ marginLeft: 8 }}
        />
      </Pressable>

      {lotsCount > 0 && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f2f2f2",
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
              gap: 6,
            }}
          >
            <FontAwesome5 name="th-list" size={13} color={PRIMARY} />
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: "#1a1a2e" }}
            >
              Lots ({lotsCount})
            </Text>
          </View>
          {product.lots.map((lot, idx) => (
            <LotItem
              key={`${lot.idItem}-${lot.Lot}-${idx}`}
              lot={lot}
              onPreparerLot={onPreparerLot ? () => onPreparerLot(lot) : undefined}
            />
          ))}
        </View>
      )}

      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f2f2f2",
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
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
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: "#f2f2f2",
          }}
        >
          {canUpdate && onManageLots && (
            <Pressable
              onPress={onManageLots}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: PRIMARY + "18",
                gap: 6,
              }}
            >
              <FontAwesome5 name="exchange-alt" size={14} color={PRIMARY} />
              <Text
                style={{ color: PRIMARY, fontWeight: "600", fontSize: 13 }}
              >
                Lots
              </Text>
            </Pressable>
          )}
          {canDelete && onDeleteProduct && (
            <Pressable
              onPress={onDeleteProduct}
              style={{
                width: 44,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: "#ef444412",
              }}
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
  const openManageLotsSheet = useDemandeTransfertSheetStore(
    (s) => s.openManageLotsSheet,
  );
  const openPreparerConfirmSheet = useDemandeTransfertSheetStore(
    (s) => s.openPreparerConfirmSheet,
  );
  const finishPreparer = useDemandeTransfertSheetStore(
    (s) => s.finishPreparer,
  );
  const openStatutSelectorSheet = useDemandeTransfertSheetStore(
    (s) => s.openStatutSelectorSheet,
  );
  const openDeleteDTConfirmSheet = useDemandeTransfertSheetStore(
    (s) => s.openDeleteDTConfirmSheet,
  );
  const finishDeleteDT = useDemandeTransfertSheetStore(
    (s) => s.finishDeleteDT,
  );
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

  const { data: listData } = useQuery({
    queryKey: ["demande-transferts", "list"],
    queryFn: () => listDemandeTransfert({ page: 1 }),
    enabled: canView && Boolean(demandeTransfertId),
  });

  const transfertItem = useMemo(() => {
    if (!listData?.data) return null;
    return (
      listData.data.find(
        (item) => String(item.id) === String(demandeTransfertId),
      ) ?? null
    );
  }, [listData, demandeTransfertId]);

  const products = detailsData?.details ?? [];
  const statutStyle = transfertItem
    ? STATUT_STYLE[transfertItem.statut] ?? { bg: "#9ca3af22", text: "#9ca3af" }
    : { bg: "#9ca3af22", text: "#9ca3af" };

  const handleAddProduct = () => {
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

  const handleManageLots = (product: DemandeTransfertProduct) => {
    openManageLotsSheet({
      idDT: Number(demandeTransfertId),
      idProduit: product.idProduit,
      productDetailId: product.id,
      productName: product.produit,
      currentLots: product.lots ?? [],
    });
  };

  const handlePreparerProduct = (product: DemandeTransfertProduct) => {
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
            text2:
              error.message || "Impossible de changer le statut.",
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
            text2:
              error.message || "Impossible de supprimer la demande.",
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
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          backgroundColor: "#f7f8fa",
        }}
      >
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text
          style={{
            marginTop: 12,
            color: "#666",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Vous n'avez pas la permission de consulter cette demande.
        </Text>
      </SafeAreaView>
    );
  }

  if (detailsLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
      >
        {transfertItem && (
          <View
            style={{
              padding: 16,
              backgroundColor: "#fff",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#efefef",
              marginBottom: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e" }}
              >
                {transfertItem.reference}
              </Text>
              {canUpdate ? (
                <Pressable onPress={handleChangeStatut}>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: statutStyle.bg,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: statutStyle.text,
                      }}
                    >
                      {transfertItem.statut}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: statutStyle.bg,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: statutStyle.text,
                    }}
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
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {canUpdate && (
              <Pressable
                onPress={handleEditDT}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: PRIMARY + "18",
                  gap: 6,
                }}
              >
                <FontAwesome5 name="edit" size={14} color={PRIMARY} />
                <Text style={{ color: PRIMARY, fontWeight: "600", fontSize: 14 }}>
                  Modifier
                </Text>
              </Pressable>
            )}
            {canDelete && (
              <Pressable
                onPress={handleDeleteDT}
                style={{
                  width: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: "#ef444412",
                }}
              >
                <FontAwesome5 name="trash" size={16} color="#ef4444" />
              </Pressable>
            )}
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            gap: 8,
          }}
        >
          <FontAwesome5 name="boxes" size={16} color={PRIMARY} />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a2e", flex: 1 }}>
            Produits ({products.length})
          </Text>
          {canCreate && (
            <Pressable
              onPress={handleAddProduct}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: PRIMARY,
              }}
            >
              <FontAwesome5 name="plus" size={12} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
                Ajouter
              </Text>
            </Pressable>
          )}
        </View>

        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canDelete={canDelete}
              canUpdate={canUpdate}
              onDeleteProduct={() => handleDeleteProduct(product)}
              onManageLots={() => handleManageLots(product)}
              onPreparerProduct={() => handlePreparerProduct(product)}
              onPreparerLot={(lot) => handlePreparerLot(lot)}
            />
          ))
        ) : (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 30,
              backgroundColor: "#fff",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#efefef",
            }}
          >
            <FontAwesome5 name="box-open" size={32} color="#ddd" />
            <Text style={{ color: "#ccc", marginTop: 10, fontSize: 14 }}>
              Aucun produit
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};