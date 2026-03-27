import { getReturnById } from "@/api/return.api";
import Loader from "@/components/Loader";
import { apiUrl } from "@/constants/query";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

const formatUploadDate = (value?: string | null) => {
  if (!value) {
    return "Date inconnue";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildImageUrl = (cheminFichier?: string, nomFichier?: string) => {
  const rawPath = (cheminFichier ?? "").trim();
  const fileName = (nomFichier ?? "").trim();

  if (!rawPath && !fileName) {
    return null;
  }

  const basePath = rawPath || fileName;

  if (/^(https?:)?\/\//i.test(basePath)) {
    return basePath;
  }

  const normalizedBaseUrl = (apiUrl ?? "").replace(/\/$/, "");
  if (!normalizedBaseUrl) {
    return basePath;
  }

  return `${normalizedBaseUrl}/sdkboard/${basePath.replace(/^\/+/, "")}`;
};

export const ReturnDetailsScreen = () => {
  const { returnId } = useLocalSearchParams<{ returnId: string }>();
  const [previewImage, setPreviewImage] = useState<{
    uri: string;
    dateUpload: string | null;
  } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["returns", "details", returnId],
    queryFn: () => getReturnById({ id: String(returnId) }),
    enabled: Boolean(returnId),
  });

  const statusUi = useMemo(() => {
    if (data?.statut === "terminer") {
      return {
        label: "Terminé",
        bg: SUCCESS + "22",
        color: SUCCESS,
      };
    }

    return {
      label: data?.statut === "envoyer" ? "Envoyé" : "En cours",
      bg: PRIMARY + "22",
      color: PRIMARY,
    };
  }, [data?.statut]);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 14,
        marginTop: 4,
        backgroundColor: "#f7f8fa",
      }}
    >
      {isLoading ? (
        <Loader />
      ) : isError || !data ? (
        <View
          style={{
            marginTop: 40,
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ color: "#888", fontSize: 14 }}>
            Impossible de charger les détails du retour.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              padding: 16,
              backgroundColor: "#fff",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#efefef",
              marginBottom: 12,
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
                Retour #{data.id}
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: statusUi.bg,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: statusUi.color,
                  }}
                >
                  {statusUi.label}
                </Text>
              </View>
            </View>

            <DetailRow
              icon="building"
              label="Client"
              value={data.client || "—"}
            />
            <DetailRow
              icon="exclamation-triangle"
              label="Motif du retour"
              value={data.reclamation || "—"}
            />
            <DetailRow
              icon="exclamation-triangle"
              label="Retour MSE"
              value={data.retour_Mse === "oui" ? "Oui" : "Non"}
            />
            <DetailRow
              icon="file-signature"
              label="BL cacheté"
              value={data.Bl_cachetet === "oui" ? "Oui" : "Non"}
            />
            <DetailRow
              icon="money-check-alt"
              label="Règlement"
              value={data.reglement === "oui" ? "Oui" : "Non"}
            />
          </View>

          <View
            style={{
              padding: 16,
              backgroundColor: "#fff",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#efefef",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                columnGap: 8,
              }}
            >
              <FontAwesome5 name="file-image" size={14} color={PRIMARY} />
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e" }}
              >
                Images ({data.images?.length ?? 0})
              </Text>
            </View>

            {data.images && data.images.length > 0 ? (
              <View style={{ rowGap: 10 }}>
                {data.images.map((image) => {
                  const imageUrl = buildImageUrl(
                    image.chemin_fichier,
                    image.nom_fichier,
                  );

                  if (!imageUrl) {
                    return null;
                  }

                  return (
                    <Pressable
                      key={image.id}
                      onPress={() =>
                        setPreviewImage({
                          uri: imageUrl,
                          dateUpload: image.date_upload ?? null,
                        })
                      }
                      style={{
                        borderWidth: 1,
                        borderColor: "#eee",
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={{
                          width: "100%",
                          height: 220,
                          borderRadius: 8,
                          backgroundColor: "#f2f2f2",
                        }}
                        contentFit="cover"
                        transition={120}
                      />
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: "#777",
                          fontWeight: "500",
                        }}
                      >
                        Upload: {formatUploadDate(image.date_upload)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: "#888" }}>Aucune image</Text>
            )}
          </View>
        </ScrollView>
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
            {previewImage?.uri ? (
              <Image
                source={{ uri: previewImage.uri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
              />
            ) : null}

            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "rgba(0,0,0,0.65)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                {formatUploadDate(previewImage?.dateUpload)}
              </Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
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
