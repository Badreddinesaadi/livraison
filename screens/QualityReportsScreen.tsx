import {
  deleteQualityReport,
  listQualityReports,
} from "@/api/quality-report.api";
import Loader from "@/components/Loader";
import { QualityReportCard } from "@/components/QualityReportCard";
import { Button } from "@/components/ui/button";
import { hasRapportQualitePermission } from "@/constants/permissions";
import { Colors } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { useQualityReportSheetStore } from "@/stores/quality-report.store";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

export const QualityReportsScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canListQualityReports = hasRapportQualitePermission(user, "LIST");
  const canCreateQualityReport = hasRapportQualitePermission(user, "CREATE");
  const canDeleteQualityReport = hasRapportQualitePermission(user, "DELETE");
  const openQualityReportDeleteConfirm = useQualityReportSheetStore(
    (s) => s.openQualityReportDeleteConfirm,
  );
  const finishQualityReportDelete = useQualityReportSheetStore(
    (s) => s.finishQualityReportDelete,
  );
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchText]);

  const { mutate: deleteQualityReportMutate, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteQualityReport,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["quality-reports"] });
        Toast.show({
          type: "success",
          text1: "Rapport supprimé",
          text2: "Le rapport qualité a été supprimé avec succès.",
        });
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Suppression impossible",
          text2: error.message || "Impossible de supprimer ce rapport.",
        });
      },
      onSettled: finishQualityReportDelete,
    });

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["quality-reports", "list", debouncedSearch],
      queryFn: ({ pageParam }) =>
        listQualityReports({
          page: pageParam,
          search: debouncedSearch || undefined,
        }),
      enabled: canListQualityReports,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const pagination = lastPage.pagination;
        if (!pagination || pagination.page >= pagination.totalPages) {
          return undefined;
        }

        return pagination.page + 1;
      },
    });

  const listData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data ?? []) ?? [];
  }, [data]);

  const handleDelete = (reportId: number) => {
    if (!canDeleteQualityReport) {
      Toast.show({
        type: "error",
        text1: "Permission refusée",
        text2: "Vous n'avez pas la permission de supprimer ce rapport.",
      });
      return;
    }

    if (isDeleting) {
      return;
    }

    openQualityReportDeleteConfirm(reportId, (targetId) => {
      deleteQualityReportMutate(targetId);
    });
  };

  if (!canListQualityReports) {
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
          Vous n'avez pas la permission d'accéder au module Rapport qualité.
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
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 4,
            columnGap: 8,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderColor: "#e8e8e8",
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 12,
            }}
          >
            <FontAwesome5 name="search" size={14} color="#bbb" />
            <TextInput
              style={{
                flex: 1,
                height: 46,
                paddingHorizontal: 10,
                fontSize: 14,
                color: "#222",
              }}
              placeholder="Rechercher un rapport..."
              placeholderTextColor="#bbb"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>
          {canCreateQualityReport && (
            <View>
              <Button
                preset="filled"
                LeftAccessory={() => (
                  <FontAwesome5
                    name="plus"
                    size={22}
                    color={Colors.light.background}
                  />
                )}
                size="md"
                onPress={() => {
                  router.navigate(
                    "/(app)/(drawer)/(stack)/quality-reports/create",
                  );
                }}
              />
            </View>
          )}
        </View>

        <Text style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
          {listData.length} rapport{listData.length !== 1 ? "s" : ""}
        </Text>

        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <QualityReportCard
              item={item}
              canDeleteQualityReport={canDeleteQualityReport}
              onShowDetails={() => {
                router.navigate({
                  pathname: "/quality-reports/details/[qualityReportId]",
                  params: { qualityReportId: String(item.id) },
                });
              }}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          ListFooterComponent={isFetchingNextPage ? <Loader /> : null}
          ListEmptyComponent={
            isLoading ? (
              <Loader />
            ) : (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <FontAwesome5 name="file-alt" size={40} color="#ddd" />
                <Text style={{ color: "#ccc", marginTop: 14, fontSize: 14 }}>
                  Aucun rapport trouvé
                </Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
};
