import { getVoyageById } from "@/api/voyage.api";
import Loader from "@/components/Loader";
import { DetailRow } from "@/components/voyageCard";
import { hasVoyagePermission } from "@/constants/permissions";
import { PRIMARY, SUCCESS } from "@/constants/theme";
import { getApiUrl } from "@/stores/api-url.store";
import { useSession } from "@/stores/auth.store";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

  const combinedPath = getApiUrl() + "/" + rawPath;

  if (/^(https?:)?\/\//i.test(combinedPath)) {
    return combinedPath;
  }

  const normalizedBaseUrl = (getApiUrl() ?? "").replace(/\/$/, "");
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
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>
          Vous n&apos;avez pas la permission de consulter les voyages.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Loader />
      ) : isError || !data ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Impossible de charger les détails du voyage.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Voyage #{data.id}</Text>
              <View
                style={[
                  styles.statusPill,
                  data.statut === "terminer"
                    ? styles.statusPillDone
                    : styles.statusPillProgress,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    data.statut === "terminer"
                      ? styles.statusTextDone
                      : styles.statusTextProgress,
                  ]}
                >
                  {data.statut === "terminer" ? "Terminé" : "En cours"}
                </Text>
              </View>
            </View>

            <DetailRow
              icon="exchange-alt"
              label="Type"
              value={
                data.type_vehicule === "location"
                  ? "Véhicule loué"
                  : "Véhicule société"
              }
            />
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
              value={
                data.type_vehicule === "location"
                  ? data.societe_location_nom || "—"
                  : data.vehicule_nom || data.vehicule_immatriculation || "—"
              }
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

          <View style={[styles.card, styles.cardLast]}>
            <View style={styles.sectionHeaderRow}>
              <FontAwesome5 name="file-alt" size={14} color={PRIMARY} />
              <Text style={styles.sectionTitle}>
                BLs ({data.bl_list?.length ?? 0})
              </Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statPrimary}>{blsEncoursCount} en cours</Text>
              <Text style={styles.statSuccess}>
                {blsLivreCount > 0
                  ? `${blsLivreCount} livré${blsLivreCount > 1 ? "s" : ""}`
                  : "0 livré"}
              </Text>
            </View>

            {data.bl_list?.length ? (
              <View style={styles.blList}>
                {data.bl_list.map((bl) => (
                  <View key={bl.id} style={styles.blCard}>
                    <View style={styles.blHeaderRow}>
                      <View style={styles.blHeaderLeft}>
                        <Text
                          style={[
                            styles.blCode,
                            bl.statut === "Livré" && styles.blCodeDelivered,
                          ]}
                        >
                          {bl.code}
                        </Text>
                        {(bl.images?.length ?? 0) > 0 && (
                          <View style={styles.imageCountWrap}>
                            <Text style={styles.imageCountText}>
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
                      {bl._pendingSync ? (
                        <Text style={styles.syncText}>
                          En attente de sync
                        </Text>
                      ) : bl.statut === "Livré" ? (
                        <FontAwesome5
                          name="check-circle"
                          size={12}
                          color={SUCCESS}
                        />
                      ) : (
                        <Text style={styles.syncText}>En cours</Text>
                      )}
                    </View>

                    <Text style={styles.clientText}>
                      {bl.nomClient || "Client inconnu"}
                    </Text>

                    {bl.images && bl.images.length > 0 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imagesContent}
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
                                style={styles.thumb}
                                contentFit="cover"
                                transition={120}
                              />
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    ) : (
                      <Text style={styles.noImageText}>Aucune image</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noBlText}>Aucun BL</Text>
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
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            {previewImage?.uri ? (
              <Image
                source={{ uri: previewImage.uri }}
                style={styles.previewImage}
                contentFit="contain"
              />
            ) : null}

            <View style={styles.previewDateBadge}>
              <Text style={styles.previewDateText}>
                {formatUploadDate(previewImage?.dateUpload)}
              </Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
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
    paddingHorizontal: 14,
    marginTop: 4,
    backgroundColor: "#f7f8fa",
  },
  errorBox: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  errorText: {
    color: "#888",
    fontSize: 14,
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#efefef",
    marginBottom: 12,
  },
  cardLast: {
    marginBottom: 20,
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
  statusPillDone: {
    backgroundColor: SUCCESS + "22",
  },
  statusPillProgress: {
    backgroundColor: PRIMARY + "22",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextDone: {
    color: SUCCESS,
  },
  statusTextProgress: {
    color: PRIMARY,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    columnGap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  statsRow: {
    flexDirection: "row",
    columnGap: 10,
    marginBottom: 10,
  },
  statPrimary: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: "600",
  },
  statSuccess: {
    fontSize: 12,
    color: SUCCESS,
    fontWeight: "600",
  },
  blList: {
    rowGap: 10,
  },
  blCard: {
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },
  blHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  blHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  blCode: {
    fontSize: 13,
    color: "#222",
    fontWeight: "700",
  },
  blCodeDelivered: {
    color: SUCCESS,
  },
  imageCountWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  imageCountText: {
    color: SUCCESS,
  },
  syncText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: "600",
  },
  clientText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  imagesContent: {
    columnGap: 8,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  noImageText: {
    fontSize: 12,
    color: "#aaa",
  },
  noBlText: {
    fontSize: 13,
    color: "#888",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewDateBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewDateText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});
