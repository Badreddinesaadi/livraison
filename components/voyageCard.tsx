import { VoyageListItem } from "@/api/voyage.api";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { LayoutAnimation, Pressable, Text, View } from "react-native";

export const VoyageCard = ({
  item,
  onDelete,
  onUpdate,
  onOpenCloseBL,
  onAcheveVoyage,
}: {
  item: VoyageListItem;
  onDelete: () => void;
  onUpdate: () => void;
  onOpenCloseBL: () => void;
  onAcheveVoyage: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { user } = useSession();
  const isAdminOrAdv = user?.role === "adv" || user?.role === "admin";
  //   const isAdminOrAdv = false;
  const bls = item.bl_list;
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
    <Pressable
      onPress={toggle}
      style={{
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
      }}
    >
      {/* ── Header row ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor:
              item.statut === "terminer" ? SUCCESS + "33" : PRIMARY + "33",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <FontAwesome5
            name="truck"
            size={16}
            color={item.statut === "terminer" ? SUCCESS : PRIMARY}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: "#1a1a2e" }}>
            Voyage #{item.id}
          </Text>
          <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
            {item.nomChauffeur}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", marginRight: 10 }}>
          <Text style={{ fontSize: 12, color: "#aaa" }}>{departDate}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: PRIMARY,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {blsEncoursCount !== 0 &&
                `${blsEncoursCount} ${blsEncoursCount > 1 ? "BLs" : "BL"} en cours`}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: SUCCESS,
                fontWeight: "600",
                marginTop: 2,
              }}
            >
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
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f2f2f2",
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <FontAwesome5
              name="file-alt"
              size={13}
              color={PRIMARY}
              style={{ width: 18, marginTop: 1 }}
            />
            <Text style={{ fontSize: 13, color: "#888", width: 96 }}>BLs</Text>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                flexWrap: "wrap",
                columnGap: 10,
                rowGap: 6,
              }}
            >
              {bls?.length ? (
                bls.map((bl) => {
                  const isDelivered = bl.statut === "Livré";
                  return (
                    <View
                      key={bl.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: isDelivered ? SUCCESS : "#222",
                          fontWeight: isDelivered ? "700" : "400",
                        }}
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
                    </View>
                  );
                })
              ) : (
                <Text style={{ fontSize: 13, color: "#222" }}>—</Text>
              )}
            </View>
          </View>
          <DetailRow
            icon="map-marker-alt"
            label="Dépôt départ"
            value={item.depot_nom || "—"}
          />
          <DetailRow
            icon="car"
            label="Véhicule"
            value={item.idVehicule ? String(item.idVehicule) : "—"}
          />
          <DetailRow
            icon="tachometer-alt"
            label="Km départ"
            value={item.km_depart ? `${item.km_depart} km` : "—"}
          />

          {/* Action buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#f2f2f2",
            }}
          >
            {isAdminOrAdv && item.statut !== "terminer" && (
              <Pressable
                onPress={onUpdate}
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
                <FontAwesome5 name="edit" size={14} color={PRIMARY} />
                <Text
                  style={{ color: PRIMARY, fontWeight: "600", fontSize: 13 }}
                >
                  Modifier
                </Text>
              </Pressable>
            )}
            {item.statut !== "terminer" &&
              !isAdminOrAdv &&
              blsEncoursCount > 0 && (
                <Pressable
                  onPress={onOpenCloseBL}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: "#25f27079",
                    gap: 6,
                  }}
                >
                  <FontAwesome5
                    name={"check-circle"}
                    size={14}
                    color={"#0c5c2a"}
                  />
                  <Text
                    style={{
                      color: "#0c5c2a",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    Clôturer BL
                  </Text>
                </Pressable>
              )}
            {isAdminOrAdv && item.statut !== "terminer" && (
              <Pressable
                onPress={onAcheveVoyage}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor:
                    blsEncoursCount > 0 ? PRIMARY + "18" : "#25f27079",
                  gap: 6,
                }}
              >
                <FontAwesome5
                  name="check-circle"
                  size={14}
                  color={blsEncoursCount > 0 ? PRIMARY : "#0c5c2a"}
                />
                <Text
                  style={{
                    color: blsEncoursCount > 0 ? PRIMARY : "#0c5c2a",
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  Achever
                </Text>
              </Pressable>
            )}
            {isAdminOrAdv && (
              <Pressable
                onPress={onDelete}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: "#ff4d4f18",
                  gap: 6,
                }}
              >
                <FontAwesome5 name="trash-alt" size={14} color="#ff4d4f" />
                <Text
                  style={{
                    color: "#ff4d4f",
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  Supprimer
                </Text>
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
    <Text style={{ fontSize: 13, color: "#888", width: 96 }}>{label}</Text>
    <Text style={{ fontSize: 13, color: "#222", flex: 1, flexWrap: "wrap" }}>
      {value}
    </Text>
  </View>
);
