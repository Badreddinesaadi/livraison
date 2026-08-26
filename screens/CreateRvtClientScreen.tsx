import { ListClients } from "@/api/users.api";
import {
  RvtFooterButton,
  RvtSelectorField,
  RvtTextInput,
  SectionCard,
} from "@/components/RvtFormFields";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useReferenceData } from "@/hooks/use-reference-data";
import { useSession } from "@/stores/auth.store";
import { useCreateVisitStore } from "@/stores/create-visit.store";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { Client } from "@/types/user.types";
import { ContactRole } from "@/types/rvt.types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const CAPTURE_TIMEOUT_MS = 15000;

export default function CreateRvtClientScreen() {
  const router = useRouter();
  const { user } = useSession();
  const canCreate = hasRapportVisitePermission(user, "CREATE");

  const store = useCreateVisitStore();
  const openSelect = useRvtSheetStore((s) => s.openSelect);
  const { data: refData } = useReferenceData();

  const [isCapturing, setIsCapturing] = useState(false);

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients", "full-list"],
    queryFn: () => ListClients(),
  });

  useEffect(() => {
    if (!store.startedAt && store.type === "create") {
      store.setLocation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptureLocation = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        store.setLocation({
          status: "GPS_DENIED",
          capturedAt: new Date().toISOString(),
        });
        Toast.show({
          type: "error",
          text1: "Localisation refusée",
          text2: "Autorisez la localisation pour la visite.",
        });
        return;
      }

      const timeout = setTimeout(() => {
        store.setLocation({
          status: "GPS_TIMEOUT",
          capturedAt: new Date().toISOString(),
        });
        Toast.show({
          type: "error",
          text1: "Délai dépassé",
          text2: "Impossible d'obtenir la position.",
        });
      }, CAPTURE_TIMEOUT_MS);

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      clearTimeout(timeout);

      const { latitude, longitude, accuracy } = position.coords;
      store.setLocation({
        status: "GPS_VALIDATED",
        latitude,
        longitude,
        accuracy: accuracy ?? undefined,
        capturedAt: new Date().toISOString(),
      });
    } catch {
      store.setLocation({
        status: "GPS_UNAVAILABLE",
        capturedAt: new Date().toISOString(),
      });
      Toast.show({
        type: "error",
        text1: "Position indisponible",
        text2: "Impossible de récupérer votre position.",
      });
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, store]);

  const handleSelectClient = () => {
    if (!clients?.length) {
      Toast.show({
        type: "error",
        text1: "Aucun client",
        text2: "La liste des clients est indisponible.",
      });
      return;
    }
    openSelect({
      title: "Sélectionner un client",
      options: clients.map((c) => ({
        id: String(c.id),
        label: c.societe || "Client sans nom",
        subLabel: [c.ville, c.telephone].filter(Boolean).join(" · "),
      })),
      selectedId: store.client ? String(store.client.id) : undefined,
      enableSearch: true,
      searchPlaceholder: "Rechercher par nom, ville...",
      onSelect: (id) => {
        const match = clients.find((c) => String(c.id) === id);
        if (match) store.setClient(match);
      },
    });
  };

  const handleSelectContactRole = () => {
    const roles = refData?.contactRoles ?? [];
    if (!roles.length) {
      Toast.show({
        type: "error",
        text1: "Aucune option",
        text2: "La liste des rôles de contact est indisponible.",
      });
      return;
    }
    openSelect({
      title: "Contact rencontré",
      options: roles.map((role) => ({ id: role, label: role })),
      selectedId: store.contactRole ?? undefined,
      onSelect: (id) => store.setContactRole(id as ContactRole),
    });
  };

  const handleNext = () => {
    if (!store.client) {
      Toast.show({
        type: "error",
        text1: "Client requis",
        text2: "Sélectionnez un client avant de continuer.",
      });
      return;
    }
    router.navigate("/rvt/create/profil");
  };

  if (!canCreate) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>
          {"Vous n'avez pas la permission de créer un rapport de visite."}
        </Text>
      </View>
    );
  }

  const location = store.location;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title="Localisation GPS" icon="map-marker-alt">
          {location?.status === "GPS_VALIDATED" ? (
            <View style={styles.fieldStack}>
              <FieldRow
                icon="check-circle"
                label="Statut"
                value="Validée"
                color={PRIMARY}
              />
              <FieldRow
                icon="globe"
                label="Latitude"
                value={location.latitude?.toFixed(5) ?? "-"}
              />
              <FieldRow
                icon="globe"
                label="Longitude"
                value={location.longitude?.toFixed(5) ?? "-"}
              />
              <FieldRow
                icon="bullseye"
                label="Précision"
                value={
                  location.accuracy
                    ? `±${Math.round(location.accuracy)} m`
                    : "-"
                }
              />
            </View>
          ) : location?.status === "GPS_TIMEOUT" ? (
            <Text style={styles.statusText}>
              Le délai de capture GPS a été dépassé.
            </Text>
          ) : location?.status === "GPS_DENIED" ? (
            <Text style={styles.statusText}>
              La localisation a été refusée.
            </Text>
          ) : location?.status === "GPS_UNAVAILABLE" ? (
            <Text style={styles.statusText}>
              La position est actuellement indisponible.
            </Text>
          ) : (
            <Text style={styles.statusTextMuted}>
              Aucune position capturée.
            </Text>
          )}

          <Pressable
            onPress={handleCaptureLocation}
            disabled={isCapturing}
            style={[
              styles.captureButton,
              isCapturing && styles.captureButtonDisabled,
            ]}
          >
            <FontAwesome5
              name={isCapturing ? "spinner" : "crosshairs"}
              size={14}
              color={PRIMARY}
            />
            <Text style={styles.captureButtonText}>
              {isCapturing ? "Capture en cours..." : "Capturer la position"}
            </Text>
          </Pressable>
        </SectionCard>

        <SectionCard title="Client" icon="building">
          <RvtSelectorField
            label="Client visité"
            value={store.client?.societe || undefined}
            placeholder={
              isLoadingClients
                ? "Chargement des clients..."
                : "Rechercher un client"
            }
            onPress={handleSelectClient}
            required
          />
          {store.client ? (
            <View style={styles.fieldStack}>
              <FieldRow
                icon="map-marker-alt"
                label="Ville"
                value={store.client.ville || "-"}
              />
              <FieldRow
                icon="phone"
                label="Téléphone"
                value={store.client.telephone || "-"}
              />
              <FieldRow
                icon="user-tag"
                label="Commercial"
                value={
                  (store.client as Client & { commercial_nom?: string })
                    .commercial_nom || "-"
                }
              />
            </View>
          ) : null}
        </SectionCard>

        <SectionCard title="Contact rencontré" icon="id-badge">
          <RvtSelectorField
            label="Rôle du contact"
            value={store.contactRole ?? undefined}
            placeholder="Sélectionner"
            onPress={handleSelectContactRole}
          />
          {store.contactRole === "Autre" ? (
            <RvtTextInput
              label="Préciser le contact (facultatif)"
              value={store.contactOther}
              onChangeText={store.setContactOther}
              placeholder="Ex. Directeur des achats"
              maxLength={500}
            />
          ) : null}
        </SectionCard>
      </ScrollView>

      <View style={styles.footer}>
        <RvtFooterButton label="Suivant" onPress={handleNext} />
      </View>
    </View>
  );
}

const FieldRow = ({
  icon,
  label,
  value,
  color = "#222",
}: {
  icon: string;
  label: string;
  value: string;
  color?: string;
}) => (
  <View style={styles.fieldRow}>
    <FontAwesome5
      name={icon as any}
      size={13}
      color={PRIMARY}
      style={styles.fieldIcon}
    />
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={[styles.fieldValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 14,
    backgroundColor: "#f7f8fa",
    paddingTop: 6,
  },
  scrollContent: {
    paddingBottom: 14,
    gap: 12,
  },
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
  fieldStack: {
    rowGap: 6,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  fieldIcon: {
    width: 18,
    marginTop: 1,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#888",
    width: 96,
  },
  fieldValue: {
    fontSize: 13,
    flex: 1,
    flexWrap: "wrap",
  },
  statusText: {
    color: "#666",
    fontSize: 13,
  },
  statusTextMuted: {
    color: "#999",
    fontSize: 13,
  },
  captureButton: {
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + "10",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonText: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    paddingBottom: 14,
  },
});
