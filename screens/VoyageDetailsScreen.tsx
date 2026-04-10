import { getVoyageById } from "@/api/voyage.api";
import Loader from "@/components/Loader";
import { DetailRow } from "@/components/voyageCard";
import { hasVoyagePermission } from "@/constants/permissions";
import { apiUrl } from "@/constants/query";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

const formatDate = (value: string | null) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

  const combinedPath = apiUrl + "/sdkboard/" + rawPath;

  if (/^(https?:)?\/\//i.test(combinedPath)) {
    return combinedPath;
  }

  const normalizedBaseUrl = (apiUrl ?? "").replace(/\/$/, "");
  if (!normalizedBaseUrl) {
    return combinedPath;
  }

  return `${normalizedBaseUrl}/${combinedPath.replace(/^\/+/, "")}`;
};

export const VoyageDetailsScreen = () => {
  const { user } = useSession();
  const canListVoyages = hasVoyagePermission(user, "LIST");
  const { voyageId } = useLocalSearchParams<{ voyageId: string }>();
  const [previewImage, setPreviewImage] = useState<{
    uri: string;
    dateUpload: string | null;
  } | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["voyages", "voyageDetails", voyageId],
    queryFn: () => getVoyageById({ id: parseInt(voyageId, 10) }),
    enabled: canListVoyages && Boolean(voyageId),
  });

  const blsEncoursCount =
    data?.bl_list?.filter((bl) => bl.statut === "Encours").length ?? 0;
  const blsLivreCount = (data?.bl_list?.length ?? 0) - blsEncoursCount;

  if (!canListVoyages) {
    return (
      <View
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
          Vous n'avez pas la permission de consulter les voyages.
        </Text>
      </View>
    );
  }

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
            Impossible de charger les détails du voyage.
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
                Voyage #{data.id}
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor:
                    data.statut === "terminer"
                      ? SUCCESS + "22"
                      : PRIMARY + "22",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: data.statut === "terminer" ? SUCCESS : PRIMARY,
                  }}
                >
                  {data.statut === "terminer" ? "Terminé" : "En cours"}
                </Text>
              </View>
            </View>

            <DetailRow
              icon="user"
              label="Chauffeur"
              value={data.nomChauffeur || "—"}
            />
            <DetailRow
              icon="user"
              label="Ville"
              value={data.ville_nom || "—"}
            />
            <DetailRow
              icon="calendar"
              label="Départ"
              value={formatDate(data.date_depart)}
            />
            <DetailRow
              icon="map-marker-alt"
              label="Dépôt"
              value={data.depot_nom || "—"}
            />
            <DetailRow
              icon="car"
              label="Véhicule"
              value={data.vehicule_nom || data.vehicule_immatriculation || "—"}
            />
            <DetailRow
              icon="tachometer-alt"
              label="Km départ"
              value={data.km_depart ? `${data.km_depart} km` : "—"}
            />
            <DetailRow
              icon="tachometer-alt"
              label="Km retour"
              value={data.km_retour ? `${data.km_retour} km` : "—"}
            />
            <DetailRow
              icon="clock"
              label="Retour"
              value={formatDate(data.date_retour)}
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
              <FontAwesome5 name="file-alt" size={14} color={PRIMARY} />
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#1a1a2e" }}
              >
                BLs ({data.bl_list?.length ?? 0})
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", columnGap: 10, marginBottom: 10 }}
            >
              <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: "600" }}>
                {blsEncoursCount} en cours
              </Text>
              <Text style={{ fontSize: 12, color: SUCCESS, fontWeight: "600" }}>
                {blsLivreCount > 0
                  ? `${blsLivreCount} livré${blsLivreCount > 1 ? "s" : ""}`
                  : "0 livré"}
              </Text>
            </View>

            {data.bl_list?.length ? (
              <View style={{ rowGap: 10 }}>
                {data.bl_list.map((bl) => (
                  <View
                    key={bl.id}
                    style={{
                      borderWidth: 1,
                      borderColor: "#eee",
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: bl.statut === "Livré" ? SUCCESS : "#222",
                            fontWeight: "700",
                          }}
                        >
                          {bl.code}
                        </Text>
                        {(bl.images?.length ?? 0) > 0 && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Text
                              style={{
                                color: SUCCESS,
                              }}
                            >
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
                      {bl.statut === "Livré" ? (
                        <FontAwesome5
                          name="check-circle"
                          size={12}
                          color={SUCCESS}
                        />
                      ) : (
                        <Text
                          style={{
                            fontSize: 12,
                            color: PRIMARY,
                            fontWeight: "600",
                          }}
                        >
                          En cours
                        </Text>
                      )}
                    </View>

                    <Text
                      style={{ fontSize: 12, color: "#888", marginBottom: 8 }}
                    >
                      {bl.nomClient || "Client inconnu"}
                    </Text>

                    {bl.images && bl.images.length > 0 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ columnGap: 8 }}
                      >
                        {bl.images.map((image) => {
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
                            >
                              <Image
                                source={{ uri: imageUrl }}
                                style={{
                                  width: 84,
                                  height: 84,
                                  borderRadius: 8,
                                  backgroundColor: "#f2f2f2",
                                }}
                                contentFit="cover"
                                transition={120}
                              />
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    ) : (
                      <Text style={{ fontSize: 12, color: "#aaa" }}>
                        Aucune image
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: "#888" }}>Aucun BL</Text>
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
