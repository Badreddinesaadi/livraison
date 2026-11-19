import { VoyageListItem } from "@/api/voyage.api";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export const VoyageCard = ({
  item,
  canUpdateVoyage,
  canDeleteVoyage,
  canCloseBLVoyage,
  canAcheveBLVoyage,
  onDelete,
  onMore,
  onOpenCloseBL,
  onAcheveVoyage,
}: {
  item: VoyageListItem;
  canUpdateVoyage: boolean;
  canDeleteVoyage: boolean;
  canCloseBLVoyage: boolean;
  canAcheveBLVoyage: boolean;
  onDelete: () => void;
  onMore: () => void;
  onOpenCloseBL: () => void;
  onAcheveVoyage: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const bls = item.bl_list;
  const isRented = item.type_vehicule === "location";
  // opened bls count
  const blsEncoursCount = useMemo(() => {
    return bls?.filter((bl) => bl.statut === "Encours").length ?? 0;
  }, [bls]);
  const departDate = item.date_depart
    ? new Date(item.date_depart).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Pressable onPress={toggle} style={styles.card}>
      {/* ── Header row ── */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconBubble,
            item.statut === "terminer" && styles.iconBubbleDone,
          ]}
        >
          <FontAwesome5
            name="truck"
            size={16}
            color={item.statut === "terminer" ? SUCCESS : PRIMARY}
          />
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            {isRented
              ? item.societe_location_nom || "Véhicule loué"
              : item.vehicule_immatriculation}
          </Text>
          <Text style={styles.subtitle}>
            {isRented ? item.chauffeur_externe_nom || "—" : item.nomChauffeur}
          </Text>
          {isRented && (
            <View style={styles.rentedBadge}>
              <Text style={styles.rentedBadgeText}>Loué</Text>
            </View>
          )}
        </View>

        <View style={styles.meta}>
          <Text style={styles.date}>{departDate}</Text>
          <View style={styles.blSummaryRow}>
            <Text style={styles.blPendingText}>
              {blsEncoursCount !== 0 &&
                `${blsEncoursCount} ${blsEncoursCount > 1 ? "BLs" : "BL"} en cours`}
            </Text>
            <Text style={styles.blDeliveredText}>
              {bls?.length && bls?.length - blsEncoursCount !== 0
                ? bls?.length - blsEncoursCount
                : ""}{" "}
              {bls?.length && bls?.length - blsEncoursCount !== 0
                ? "Livré"
                : ""}
            </Text>
          </View>
        </View>

        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={12}
          color="#bbb"
        />
      </View>

      {/* ── Expanded details ── */}
      {expanded && (
        <View style={styles.body}>
          <View style={styles.detailRow}>
            <FontAwesome5
              name="file-alt"
              size={13}
              color={PRIMARY}
              style={styles.detailIcon}
            />
            <Text style={styles.detailLabel}>BLs</Text>
            <View style={styles.blList}>
              {bls?.length ? (
                bls.map((bl) => {
                  const isDelivered = bl.statut === "Livré";
                  return (
                    <View key={bl.id} style={styles.blItem}>
                      <Text
                        style={
                          isDelivered
                            ? styles.blCodeDelivered
                            : styles.blCode
                        }
                      >
                        {bl.code}
                      </Text>
                      {isDelivered && (
                        <FontAwesome5
                          name="check-circle"
                          size={12}
                          color={SUCCESS}
                        />
                      )}
                      {bl._pendingSync && (
                        <FontAwesome5 name="clock" size={11} color={PRIMARY} />
                      )}
                      {(bl.images?.length ?? 0) > 0 && (
                        <View style={styles.blImages}>
                          <Text style={styles.blImageCount}>
                            {bl.images?.length ?? 0}
                          </Text>
                          <FontAwesome5
                            name="file-image"
                            size={12}
                            color={SUCCESS}
                          />
                        </View>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={styles.blEmpty}>—</Text>
              )}
            </View>
          </View>
          <DetailRow
            icon="map-marker-alt"
            label="Dépôt départ"
            value={item.depot_nom || "—"}
          />
          <DetailRow icon="city" label="Ville" value={item.ville_nom || "—"} />
          <DetailRow
            icon="exchange-alt"
            label="Type"
            value={isRented ? "Véhicule loué" : "Véhicule société"}
          />
          <DetailRow
            icon="car"
            label="Véhicule"
            value={
              isRented
                ? item.societe_location_nom || "—"
                : item.vehicule_nom
                  ? String(item.vehicule_nom) +
                    ` (${item.vehicule_immatriculation})`
                  : "—"
            }
          />
          {isRented && (
            <DetailRow
              icon="user"
              label="Chauffeur"
              value={item.chauffeur_externe_nom || "—"}
            />
          )}
          <DetailRow
            icon="tachometer-alt"
            label="Km départ"
            value={item.km_depart ? `${item.km_depart} km` : "—"}
          />

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable onPress={onMore} style={styles.moreButton}>
              <FontAwesome5 name="ellipsis-h" size={14} color={PRIMARY} />
              <Text style={styles.moreButtonText}>Plus</Text>
            </Pressable>
            {item.statut !== "terminer" &&
              canCloseBLVoyage &&
              blsEncoursCount > 0 && (
                <Pressable
                  onPress={onOpenCloseBL}
                  style={styles.closeBlButton}
                >
                  <FontAwesome5
                    name={"check-circle"}
                    size={14}
                    color={"#0c5c2a"}
                  />
                  <Text style={styles.closeBlButtonText}>Clôturer BL</Text>
                </Pressable>
              )}
            {canAcheveBLVoyage && item.statut !== "terminer" && (
              <Pressable
                onPress={onAcheveVoyage}
                style={[
                  styles.acheverButton,
                  blsEncoursCount === 0 && styles.acheverButtonDone,
                ]}
              >
                <FontAwesome5
                  name="check-circle"
                  size={14}
                  color={blsEncoursCount > 0 ? PRIMARY : "#0c5c2a"}
                />
                <Text
                  style={[
                    styles.acheverButtonText,
                    blsEncoursCount === 0 && styles.acheverButtonTextDone,
                  ]}
                >
                  Achever
                </Text>
              </Pressable>
            )}
            {canDeleteVoyage && (
              <Pressable onPress={onDelete} style={styles.deleteButton}>
                <FontAwesome5 name="trash-alt" size={14} color="#ff4d4f" />
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

export const DetailRow = ({
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#efefef",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY + "33",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBubbleDone: {
    backgroundColor: SUCCESS + "33",
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  rentedBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: PRIMARY + "22",
  },
  rentedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: PRIMARY,
  },
  meta: {
    alignItems: "flex-end",
    marginRight: 10,
  },
  date: {
    fontSize: 12,
    color: "#aaa",
  },
  blSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  blPendingText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: "600",
    marginTop: 2,
  },
  blDeliveredText: {
    fontSize: 12,
    color: SUCCESS,
    fontWeight: "600",
    marginTop: 2,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    width: 96,
  },
  detailValue: {
    fontSize: 13,
    color: "#222",
    flex: 1,
    flexWrap: "wrap",
  },
  blList: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 6,
  },
  blItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  blCode: {
    fontSize: 13,
    color: "#222",
    fontWeight: "400",
  },
  blCodeDelivered: {
    fontSize: 13,
    color: SUCCESS,
    fontWeight: "700",
  },
  blImages: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  blImageCount: {
    color: SUCCESS,
  },
  blEmpty: {
    fontSize: 13,
    color: "#222",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
  },
  moreButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY + "18",
    gap: 6,
  },
  moreButtonText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 13,
  },
  closeBlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#25f27079",
    gap: 6,
  },
  closeBlButtonText: {
    color: "#0c5c2a",
    fontWeight: "600",
    fontSize: 13,
  },
  acheverButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY + "18",
    gap: 6,
  },
  acheverButtonDone: {
    backgroundColor: "#25f27079",
  },
  acheverButtonText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 13,
  },
  acheverButtonTextDone: {
    color: "#0c5c2a",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#ff4d4f18",
    gap: 6,
  },
  deleteButtonText: {
    color: "#ff4d4f",
    fontWeight: "600",
    fontSize: 13,
  },
});
