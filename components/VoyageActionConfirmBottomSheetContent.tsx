import DateTimePicker from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type VoyageActionConfirmVariant = "achever" | "supprimer";

type VoyageActionConfirmBottomSheetContentProps = {
  variant: VoyageActionConfirmVariant;
  voyageId: number | null;
  pendingUndeliveredCount?: number;
  kmDepart?: number | null;
  minDateRetour?: string | null;
  isLoading?: boolean;
  onConfirm: (kmRetour?: number, dateRetour?: string) => void;
  onCancel: () => void;
};

const PRIMARY = "#ED5623";
const DANGER = "#ff4d4f";

type ContentConfig = {
  title: string;
  message: string;
  confirmLabel: string;
  confirmBackgroundColor: string;
};

function buildContentConfig(
  variant: VoyageActionConfirmVariant,
  voyageId: number | null,
  pendingUndeliveredCount: number,
): ContentConfig {
  if (variant === "supprimer") {
    return {
      title: "Confirmer la suppression du voyage",
      message: `Le voyage #${voyageId ?? "—"} sera supprimé définitivement. Voulez-vous continuer ?`,
      confirmLabel: "Supprimer",
      confirmBackgroundColor: DANGER,
    };
  }

  if (pendingUndeliveredCount <= 0) {
    return {
      title: "Confirmer l’achèvement du voyage",
      message: `Voulez-vous vraiment l’achever ?`,
      confirmLabel: "Confirmer",
      confirmBackgroundColor: PRIMARY,
    };
  }

  return {
    title: "Confirmer l’achèvement du voyage",
    message: `Le voyage #${voyageId ?? "—"} contient encore ${pendingUndeliveredCount} ${
      pendingUndeliveredCount > 1 ? "BLs non livrés" : "BL non livré"
    }. Voulez-vous vraiment l’achever ?`,
    confirmLabel: "Confirmer",
    confirmBackgroundColor: PRIMARY,
  };
}

export default function VoyageActionConfirmBottomSheetContent({
  variant,
  voyageId,
  pendingUndeliveredCount = 0,
  kmDepart,
  minDateRetour,
  isLoading = false,
  onConfirm,
  onCancel,
}: VoyageActionConfirmBottomSheetContentProps) {
  const [kmRetourInput, setKmRetourInput] = useState("");
  const [dateRetour, setDateRetour] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isAchever = variant === "achever";

  const parsedKmRetour = useMemo(() => {
    if (!kmRetourInput.trim()) {
      return null;
    }

    const parsed = Number(kmRetourInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  }, [kmRetourInput]);

  const content = buildContentConfig(
    variant,
    voyageId,
    pendingUndeliveredCount,
  );

  const dateRetourLabel = useMemo(() => {
    if (!dateRetour) {
      return "Sélectionner la date et l'heure retour";
    }

    return dateRetour.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [dateRetour]);

  const minDateRetourValue = useMemo(() => {
    if (!minDateRetour) {
      return undefined;
    }

    const parsed = new Date(minDateRetour);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }

    return parsed;
  }, [minDateRetour]);

  const handleConfirmPress = () => {
    if (isLoading) {
      return;
    }

    if (isAchever) {
      if (parsedKmRetour === null) {
        setErrorMessage("Veuillez saisir un kilométrage valide.");
        return;
      }

      if (!dateRetour) {
        setErrorMessage("Veuillez sélectionner la date retour.");
        return;
      }

      if (
        minDateRetourValue &&
        dateRetour.getTime() < minDateRetourValue.getTime()
      ) {
        setErrorMessage(
          `La date/heure retour ne peut pas être avant le ${minDateRetourValue.toLocaleString(
            "fr-FR",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          )}.`,
        );
        return;
      }

      if (typeof kmDepart === "number" && parsedKmRetour < kmDepart) {
        setErrorMessage(
          `Le kilométrage actuel doit être supérieur ou égal à ${kmDepart} km.`,
        );
        return;
      }
    }

    setErrorMessage(null);

    onConfirm(parsedKmRetour ?? undefined, dateRetour?.toISOString());
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#1a1a2e",
          marginBottom: 10,
        }}
      >
        {content.title}
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: "#444",
          lineHeight: 22,
          marginBottom: 16,
        }}
      >
        {content.message}
      </Text>

      {isAchever ? (
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 13,
              color: "#444",
              marginBottom: 8,
              fontWeight: "600",
            }}
          >
            Km actuel du véhicule
          </Text>
          <TextInput
            value={kmRetourInput}
            onChangeText={(text) => {
              setKmRetourInput(text.replace(/[^0-9]/g, ""));
              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
            placeholder="Ex: 125000"
            keyboardType="number-pad"
            editable={!isLoading}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: "#1a1a2e",
              backgroundColor: "#fff",
            }}
          />
          {typeof kmDepart === "number" ? (
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#666",
              }}
            >
              Km départ: {kmDepart} km
            </Text>
          ) : null}

          <Text
            style={{
              fontSize: 13,
              color: "#444",
              marginTop: 14,
              marginBottom: 8,
              fontWeight: "600",
            }}
          >
            Date et heure retour
          </Text>
          <Pressable
            onPress={() => {
              if (isLoading) return;
              setShowDatePicker(true);
              setShowTimePicker(false);
              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: "#fff",
            }}
          >
            <Text
              style={{ fontSize: 14, color: dateRetour ? "#1a1a2e" : "#999" }}
            >
              {dateRetourLabel}
            </Text>
          </Pressable>

          {showDatePicker ? (
            <DateTimePicker
              value={dateRetour || new Date()}
              mode="date"
              display="default"
              minimumDate={minDateRetourValue}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);

                if (event.type === "set" && selectedDate) {
                  const currentDate =
                    dateRetour || minDateRetourValue || new Date();
                  const mergedDate = new Date(selectedDate);
                  mergedDate.setHours(
                    currentDate.getHours(),
                    currentDate.getMinutes(),
                    0,
                    0,
                  );
                  setDateRetour(mergedDate);
                  setShowTimePicker(true);
                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }
              }}
            />
          ) : null}

          {showTimePicker ? (
            <DateTimePicker
              value={dateRetour || minDateRetourValue || new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);

                if (event.type === "set" && selectedTime) {
                  const currentDate =
                    dateRetour || minDateRetourValue || new Date();
                  const mergedDateTime = new Date(currentDate);
                  mergedDateTime.setHours(
                    selectedTime.getHours(),
                    selectedTime.getMinutes(),
                    0,
                    0,
                  );
                  setDateRetour(mergedDateTime);
                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }
              }}
            />
          ) : null}

          {errorMessage ? (
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                color: DANGER,
                fontWeight: "600",
              }}
            >
              {errorMessage}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: "row", columnGap: 10 }}>
        <Pressable
          onPress={onCancel}
          disabled={isLoading}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#ddd",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#444", fontWeight: "600", fontSize: 14 }}>
            Annuler
          </Text>
        </Pressable>

        <Pressable
          onPress={handleConfirmPress}
          disabled={isLoading}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: content.confirmBackgroundColor,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            {isLoading ? "Traitement..." : content.confirmLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
