import { ProjetLocation } from "@/api/projet-location.api";
import { apiUrl } from "@/constants/query";
import { PRIMARY } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Linking,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type ProjetLocationCardProps = {
  item: ProjetLocation;
  canManageProjetLocation?: boolean;
  onMore: () => void;
};

type ParsedLocation = {
  x: number;
  y: number;
};

const PROJET_UI = {
  chantier: {
    label: "Chantier",
    color: "#4A90E2",
    icon: "hard-hat" as const,
  },
  depot: {
    label: "Depot",
    color: "#7C3AED",
    icon: "warehouse" as const,
  },
};

const parseLocation = (value?: string | null): ParsedLocation | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (
      typeof parsed?.x === "number" &&
      Number.isFinite(parsed.x) &&
      typeof parsed?.y === "number" &&
      Number.isFinite(parsed.y)
    ) {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    return null;
  }

  return null;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildFileUrl = (cheminFichier?: string) => {
  if (!cheminFichier) {
    return null;
  }

  return `${apiUrl}/sdkboard/${cheminFichier}`;
};

export const ProjetLocationCard = ({
  item,
  canManageProjetLocation = true,
  onMore,
}: ProjetLocationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const imageCount = item.images?.length ?? 0;
  const projetUi = PROJET_UI[item.projet] ?? {
    label: "Projet",
    color: PRIMARY,
    icon: "map-marker-alt" as const,
  };

  const coordinates = useMemo(
    () => parseLocation(item.localisation),
    [item.localisation],
  );

  const coordinatesLabel = coordinates
    ? `X: ${coordinates.x.toFixed(5)} | Y: ${coordinates.y.toFixed(5)}`
    : "Coordonnees indisponibles";

  const headerSubtitle =
    item.contact_nom || item.createur || "Contact indisponible";

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const handleOpenMap = async () => {
    if (!coordinates) {
      Toast.show({
        type: "error",
        text1: "Coordonnees manquantes",
        text2: "Impossible d'ouvrir la carte.",
      });
      return;
    }

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.y},${coordinates.x}`;

    try {
      const canOpen = await Linking.canOpenURL(mapUrl);
      if (!canOpen) {
        throw new Error("unsupported");
      }

      await Linking.openURL(mapUrl);
    } catch {
      Toast.show({
        type: "error",
        text1: "Ouverture impossible",
        text2: "Impossible d'ouvrir la carte.",
      });
    }
  };

  const handleCall = async () => {
    if (!item.contact_telephone) {
      Toast.show({
        type: "error",
        text1: "Telephone manquant",
        text2: "Aucun numero disponible.",
      });
      return;
    }

    const sanitized = item.contact_telephone.replace(/\s+/g, "");
    const phoneUrl = `tel:${sanitized}`;

    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (!canOpen) {
        throw new Error("unsupported");
      }

      await Linking.openURL(phoneUrl);
    } catch {
      Toast.show({
        type: "error",
        text1: "Appel impossible",
        text2: "Impossible d'ouvrir l'application telephone.",
      });
    }
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
            backgroundColor: projetUi.color + "22",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <FontAwesome5 name={projetUi.icon} size={16} color={projetUi.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: "#1a1a2e" }}>
            {`${projetUi.label} #${item.id}`}
          </Text>
          <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
            {headerSubtitle}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", marginRight: 10 }}>
          <Text style={{ fontSize: 12, color: "#aaa" }}>
            {formatDate(item.date)}
          </Text>
          <Text style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
            {imageCount} image{imageCount > 1 ? "s" : ""}
          </Text>
        </View>

        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={12}
          color="#bbb"
        />
      </View>

      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f2f2f2",
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <DetailText
            icon="user"
            label="Contact nom"
            value={item.contact_nom || "-"}
          />
          <DetailText
            icon="phone"
            label="Telephone"
            value={item.contact_telephone || "-"}
          />
          <DetailText
            icon="user-check"
            label="Crée par"
            value={item.createur || "-"}
          />
          <DetailText
            icon="calendar"
            label="Date"
            value={formatDate(item.date)}
          />
          <DetailText
            icon="map-marker-alt"
            label="Coordonnees"
            value={coordinatesLabel}
          />
          <DetailText
            icon="comment"
            label="Commentaire"
            value={item.commentaire || "-"}
          />

          <View
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: "#f2f2f2",
            }}
          >
            <Text style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
              Images
            </Text>
            {imageCount > 0 ? (
              <FlatList
                horizontal
                data={item.images ?? []}
                keyExtractor={(img) => String(img.id)}
                contentContainerStyle={{ paddingBottom: 4 }}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item: img }) => {
                  const imageUrl = buildFileUrl(img.chemin_fichier);
                  if (!imageUrl) {
                    return null;
                  }

                  return (
                    <Pressable
                      onPress={() => setPreviewImage(imageUrl)}
                      style={{ marginRight: 10 }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={{
                          width: 96,
                          height: 72,
                          borderRadius: 10,
                          backgroundColor: "#f0f0f0",
                        }}
                      />
                    </Pressable>
                  );
                }}
              />
            ) : (
              <Text style={{ fontSize: 12, color: "#999" }}>
                Aucune image disponible
              </Text>
            )}
          </View>

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
            <Pressable
              onPress={handleOpenMap}
              disabled={!coordinates}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: PRIMARY + "18",
                gap: 6,
                opacity: coordinates ? 1 : 0.5,
              }}
            >
              <FontAwesome5 name="map-marked-alt" size={14} color={PRIMARY} />
              <Text style={{ color: PRIMARY, fontWeight: "600", fontSize: 13 }}>
                Ouvrir la carte
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCall}
              disabled={!item.contact_telephone}
              style={{
                width: 44,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: PRIMARY + "12",
                opacity: item.contact_telephone ? 1 : 0.5,
              }}
            >
              <FontAwesome5 name="phone" size={14} color={PRIMARY} />
            </Pressable>
            {canManageProjetLocation && (
              <Pressable
                onPress={onMore}
                style={{
                  width: 44,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: PRIMARY + "12",
                }}
              >
                <FontAwesome5 name="ellipsis-h" size={14} color={PRIMARY} />
              </Pressable>
            )}
          </View>
        </View>
      )}
      <Modal
        visible={Boolean(previewImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable
          onPress={() => setPreviewImage(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              aspectRatio: 3 / 4,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#111",
            }}
          >
            {previewImage ? (
              <Image
                source={{ uri: previewImage }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
              />
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </Pressable>
  );
};

const DetailText = ({
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
