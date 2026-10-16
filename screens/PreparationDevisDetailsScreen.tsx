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
  prepared,
  onPress,
}: {
  prepared: boolean;
  onPress?: () => void;
}) => {
  const badge = (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: prepared ? SUCCESS + "18" : "#f59e0b18",
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: prepared ? SUCCESS : "#f59e0b",
        }}
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
          {lot.code}
        </Text>
        <PreparerBadge prepared={lot.preparation} onPress={onPreparerLot} />
        {onReplaceLot && (
          <Pressable
            onPress={onReplaceLot}
            hitSlop={6}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: PRIMARY + "14",
              marginLeft: 6,
            }}
          >
            <FontAwesome5 name="exchange-alt" size={11} color={PRIMARY} />
            <Text style={{ fontSize: 11, fontWeight: "600", color: PRIMARY }}>
              Remplacer
            </Text>
          </Pressable>
        )}
        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={10}
          color="#bbb"
          style={{ marginLeft: 8 }}
        />
      </Pressable>
      {expanded && (
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
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
            {product.name}
          </Text>
          <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
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
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1a1a2e" }}>
              Lots ({lotsCount})
            </Text>
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
                canUpdate && onReplaceLot && !lot.preparation
                  ? () => onReplaceLot(lot)
                  : undefined
              }
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
      currentLots: product.lots ?? [],
    });
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
          Vous n&apos;avez pas la permission de consulter ce devis.
        </Text>
      </SafeAreaView>
    );
  }

  if (productsLoading) {
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
        {devisItem && (
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
                {devisItem.document}
              </Text>
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8,
              padding: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#f59e0b55",
              backgroundColor: "#f59e0b14",
              marginBottom: 14,
            }}
          >
            <FontAwesome5 name="info-circle" size={14} color="#b45309" />
            <Text style={{ flex: 1, fontSize: 12, color: "#92400e" }}>
              Ce devis n&apos;est pas validé. La préparation des produits et des
              lots n&apos;est possible que pour un devis validé.
            </Text>
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
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1a1a2e",
              flex: 1,
            }}
          >
            Produits ({products.length})
          </Text>
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
