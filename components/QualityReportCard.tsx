import { QualityReport } from "@/api/quality-report.api";
import { apiUrl } from "@/constants/query";
import { PRIMARY } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { format } from "date-fns";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { LayoutAnimation, Pressable, Text, View } from "react-native";

const formatDateLabel = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return format(parsed, "dd/MM/yyyy HH:mm");
};

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "heic",
  "avif",
];

const getFileExtension = (name?: string | null) => {
  if (!name) {
    return "";
  }

  const dotIndex = name.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === name.length - 1) {
    return "";
  }

  return name.slice(dotIndex + 1).toLowerCase();
};

const isImageFile = (name?: string | null, path?: string | null) => {
  const extension = getFileExtension(name) || getFileExtension(path);
  return IMAGE_EXTENSIONS.includes(extension);
};

const buildFileUrl = (cheminFichier?: string | null) => {
  if (!cheminFichier) {
    return null;
  }

  const normalizedBaseUrl = (apiUrl ?? "").replace(/\/$/, "");
  const normalizedPath = cheminFichier.replace(/^\/+/, "");

  if (!normalizedBaseUrl) {
    return `/sdkboard/${normalizedPath}`;
  }

  return `${normalizedBaseUrl}/sdkboard/${normalizedPath}`;
};

export const QualityReportCard = ({
  item,
  canDeleteQualityReport = true,
  onShowDetails,
  onDelete,
}: {
  item: QualityReport;
  canDeleteQualityReport?: boolean;
  onShowDetails: () => void;
  onDelete: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const imageCount = item.images?.length ?? 0;
  const createdDateLabel = useMemo(
    () => formatDateLabel(item.dateCreate),
    [item.dateCreate],
  );
  const dateLabel = useMemo(() => formatDateLabel(item.date), [item.date]);

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
            backgroundColor: PRIMARY + "18",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <FontAwesome5 name="file-alt" size={16} color={PRIMARY} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: "#1a1a2e" }}>
            RQ-{item.id}
          </Text>
          <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
            {item.dossier || item.dum || "Dossier non défini"}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", marginRight: 10 }}>
          <Text
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: "600",
              marginBottom: 2,
            }}
          >
            {createdDateLabel}
          </Text>
          <Text style={{ fontSize: 12, color: "#aaa" }}>
            {imageCount} fichier{imageCount > 1 ? "s" : ""}
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
          <DetailText icon="barcode" label="DUM" value={item.dum || "-"} />
          <DetailText
            icon="folder-open"
            label="Dossier"
            value={item.dossier || "-"}
          />
          <DetailText
            icon="comment-dots"
            label="Commentaire"
            value={item.commentaire || "-"}
          />
          <DetailText icon="clock" label="Date" value={dateLabel} />

          {imageCount > 0 && (
            <View
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: "#f2f2f2",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: "#666",
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Fichiers joints
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {(item.images ?? []).map((file) => {
                  const fileUrl = buildFileUrl(file.chemin_fichier);
                  const displayName = file.nom_fichier || `fichier-${file.id}`;
                  const canShowImage =
                    Boolean(fileUrl) &&
                    isImageFile(file.nom_fichier, file.chemin_fichier);

                  return (
                    <View
                      key={file.id}
                      style={{
                        width: 86,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#e6e6e6",
                        overflow: "hidden",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      {canShowImage ? (
                        <Image
                          source={{ uri: fileUrl! }}
                          style={{ width: "100%", height: 72 }}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: "100%",
                            height: 72,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f1f5f9",
                          }}
                        >
                          <FontAwesome5
                            name="file-alt"
                            size={18}
                            color="#64748b"
                          />
                        </View>
                      )}

                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: 10,
                          lineHeight: 12,
                          color: "#475569",
                          paddingHorizontal: 6,
                          paddingVertical: 4,
                        }}
                      >
                        {displayName}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

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
              onPress={onShowDetails}
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
              <FontAwesome5 name="eye" size={14} color={PRIMARY} />
              <Text style={{ color: PRIMARY, fontWeight: "600", fontSize: 13 }}>
                Détails
              </Text>
            </Pressable>

            {canDeleteQualityReport && (
              <Pressable
                onPress={onDelete}
                style={{
                  width: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: "#ff4d4f",
                }}
              >
                <FontAwesome5 name="trash" size={14} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>
      )}
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
