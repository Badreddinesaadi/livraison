import { createRound, listRounds } from "@/api/rounds.api";
import { RvtRoundCard } from "@/components/RvtRoundCard";
import Loader from "@/components/Loader";
import { hasRapportVisitePermission } from "@/constants/permissions";
import { PRIMARY } from "@/constants/theme";
import { useSession } from "@/stores/auth.store";
import { Round } from "@/types/rvt.types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function RvtRoundsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canList = hasRapportVisitePermission(user, "LIST");
  const canCreate = hasRapportVisitePermission(user, "CREATE");

  const [createVisible, setCreateVisible] = useState(false);
  const [nom, setNom] = useState("");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["rounds", "list", {}],
    queryFn: ({ pageParam }) => listRounds({ page: pageParam, perPage: 20 }),
    enabled: canList,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination || pagination.page >= pagination.totalPages) {
        return undefined;
      }
      return pagination.page + 1;
    },
  });

  const listData = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const { mutate: createRoundMutate, isPending } = useMutation({
    mutationFn: () => createRound(nom.trim()),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
      Toast.show({
        type: "success",
        text1: "Tournée créée",
        text2: "La tournée a été ouverte avec succès.",
      });
      setCreateVisible(false);
      setNom("");
      if (created?.id) {
        router.replace({
          pathname: "/rvt/tours/[roundId]",
          params: { roundId: created.id },
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Création impossible",
        text2: error?.message || "Une erreur est survenue.",
      });
    },
  });

  const handleCreate = () => {
    if (!nom.trim()) {
      Toast.show({
        type: "error",
        text1: "Nom requis",
        text2: "Saisissez un nom pour la tournée.",
      });
      return;
    }
    createRoundMutate();
  };

  if (!canList) {
    return (
      <View style={styles.lockScreen}>
        <FontAwesome5 name="lock" size={34} color="#bbb" />
        <Text style={styles.lockText}>Accès refusé.</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.toolbar}>
        <Text style={styles.count}>
          {listData.length} tournée{listData.length > 1 ? "s" : ""}
        </Text>
        {canCreate ? (
          <Pressable
            onPress={() => setCreateVisible(true)}
            style={styles.createButton}
          >
            <FontAwesome5 name="plus" size={12} color="#fff" />
            <Text style={styles.createButtonText}>Nouvelle tournée</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item: Round) => String(item.id)}
        renderItem={({ item }) => (
          <RvtRoundCard
            item={item}
            onShowDetails={() =>
              router.navigate({
                pathname: "/rvt/tours/[roundId]",
                params: { roundId: String(item.id) },
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListFooterComponent={isFetchingNextPage ? <Loader /> : null}
        ListEmptyComponent={
          isLoading ? (
            <Loader />
          ) : (
            <View style={styles.empty}>
              <FontAwesome5 name="route" size={40} color="#ddd" />
              <Text style={styles.emptyText}>Aucune tournée trouvée</Text>
            </View>
          )
        }
      />

      <Modal
        visible={createVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCreateVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Nouvelle tournée</Text>
            <Text style={styles.modalLabel}>Nom de la tournée</Text>
            <TextInput
              value={nom}
              onChangeText={setNom}
              placeholder="Ex. Tournée Casablanca"
              placeholderTextColor="#bbb"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setCreateVisible(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                disabled={isPending || !nom.trim()}
                style={[
                  styles.modalConfirm,
                  (isPending || !nom.trim()) && styles.modalDisabled,
                ]}
              >
                <Text style={styles.modalConfirmText}>
                  {isPending ? "Création..." : "Créer"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  lockScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fa",
  },
  lockText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  count: {
    fontSize: 13,
    color: "#888",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 24,
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#ccc",
    marginTop: 14,
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    columnGap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  modalDisabled: {
    opacity: 0.6,
  },
  modalCancelText: {
    color: "#555",
    fontWeight: "700",
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
