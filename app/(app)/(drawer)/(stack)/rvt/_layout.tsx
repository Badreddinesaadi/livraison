import MultiSelectBottomSheetContent from "@/components/MultiSelectBottomSheetContent";
import RvtDeleteConfirmBottomSheetContent from "@/components/RvtDeleteConfirmBottomSheetContent";
import RvtRoundDeleteConfirmBottomSheetContent from "@/components/RvtRoundDeleteConfirmBottomSheetContent";
import RvtRoundEditBottomSheetContent from "@/components/RvtRoundEditBottomSheetContent";
import RvtRoundToggleConfirmBottomSheetContent from "@/components/RvtRoundToggleConfirmBottomSheetContent";
import RvtSelectOptionBottomSheetContent from "@/components/RvtSelectOptionBottomSheetContent";
import { Button } from "@/components/ui/button";
import { Colors, PRIMARY } from "@/constants/theme";
import { useRvtSheetStore } from "@/stores/rvt-sheet.store";
import { FontAwesome } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CREATE_STEP_ORDER = [
  "create/client",
  "create/profil",
  "create/marche",
  "create/opportunite",
  "create/action",
];

export default function StackLayout() {
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const sheetType = useRvtSheetStore((s) => s.sheetType);
  const selectConfig = useRvtSheetStore((s) => s.selectConfig);
  const multiSelectConfig = useRvtSheetStore((s) => s.multiSelectConfig);
  const visitDeleteId = useRvtSheetStore((s) => s.visitDeleteId);
  const isVisitDeletePending = useRvtSheetStore(
    (s) => s.isVisitDeletePending,
  );
  const confirmVisitDelete = useRvtSheetStore((s) => s.confirmVisitDelete);
  const roundEditConfig = useRvtSheetStore((s) => s.roundEditConfig);
  const roundDeleteConfig = useRvtSheetStore((s) => s.roundDeleteConfig);
  const isRoundDeletePending = useRvtSheetStore((s) => s.isRoundDeletePending);
  const roundToggleConfig = useRvtSheetStore((s) => s.roundToggleConfig);
  const confirmRoundToggle = useRvtSheetStore((s) => s.confirmRoundToggle);
  const updateRoundEditDraft = useRvtSheetStore((s) => s.updateRoundEditDraft);
  const confirmRoundEdit = useRvtSheetStore((s) => s.confirmRoundEdit);
  const confirmRoundDelete = useRvtSheetStore((s) => s.confirmRoundDelete);
  const chooseSelectOption = useRvtSheetStore((s) => s.chooseSelectOption);
  const toggleMultiSelectOption = useRvtSheetStore(
    (s) => s.toggleMultiSelectOption,
  );
  const confirmMultiSelect = useRvtSheetStore((s) => s.confirmMultiSelect);
  const selectionTick = useRvtSheetStore((s) => s.selectionTick);
  const closeSheet = useRvtSheetStore((s) => s.closeSheet);
  const isSheetOpen = useRvtSheetStore((s) => s.isSheetOpen);

  const renderedMultiItems = useMemo(() => {
    if (!multiSelectConfig) return null;
    const selected = multiSelectConfig.getSelectedIds();
    return multiSelectConfig.items.map((item) => ({
      ...item,
      selected: selected.includes(item.id),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiSelectConfig, selectionTick]);

  const snapPoints = useMemo(() => {
    switch (sheetType) {
      case "rvt-select":
        return ["60%"];
      case "rvt-multi":
        return ["65%"];
      case "rvt-visit-delete-confirm":
        return ["30%"];
      case "rvt-round-edit":
        return ["55%"];
      case "rvt-round-delete-confirm":
        return ["30%"];
      case "rvt-round-toggle-confirm":
        return ["30%"];
      default:
        return ["50%"];
    }
  }, [sheetType]);

  const isManagedSheetOpen =
    isSheetOpen &&
    (sheetType === "rvt-select" ||
      sheetType === "rvt-multi" ||
      sheetType === "rvt-visit-delete-confirm" ||
      sheetType === "rvt-round-edit" ||
      sheetType === "rvt-round-delete-confirm" ||
      sheetType === "rvt-round-toggle-confirm");

  const { top, bottom } = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rotation = useRef(new Animated.Value(0));
  const animationRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const startSpin = () => {
    try {
      rotation.current.setValue(0);
      animationRef.current = Animated.loop(
        Animated.timing(rotation.current, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animationRef.current.start();
    } catch {
      // noop
    }
  };

  const stopSpin = () => {
    try {
      animationRef.current?.stop();
    } catch {
      // noop
    }
    rotation.current.setValue(0);
    animationRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopSpin();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isManagedSheetOpen) {
      bottomSheetRef.current?.snapToIndex(0);
      return;
    }
    bottomSheetRef.current?.close();
  }, [isManagedSheetOpen]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <GestureHandlerRootView style={[styles.root, { paddingBottom: bottom }]}>
      <Stack
        screenOptions={{
          animation: "ios_from_right",
          header: (s) => {
            const stepIndex = CREATE_STEP_ORDER.indexOf(s.route.name);
            return (
              <View
                style={[styles.header, { marginTop: top }]}
              >
                <View style={styles.headerRow}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      if (s.route.name === "index") {
                        s.navigation.replace("(app)/(drawer)", {});
                      } else {
                        s.navigation.goBack();
                      }
                    }}
                  >
                    <FontAwesome name="arrow-left" size={24} color="black" />
                  </TouchableWithoutFeedback>
                  <Text style={styles.headerTitle}>
                    {headerTitles[s.route.name] ?? "Rapports de visite"}
                  </Text>
                  <Button
                    preset="ghost"
                    onPress={() => {
                      if (isRefreshing) {
                        return;
                      }
                      setIsRefreshing(true);
                      startSpin();
                      queryClient.invalidateQueries({ queryKey: ["visits"] });
                      queryClient.invalidateQueries({ queryKey: ["rounds"] });
                      queryClient.invalidateQueries({ queryKey: ["rvt-analytics"] });
                      timeoutRef.current = setTimeout(() => {
                        stopSpin();
                        setIsRefreshing(false);
                      }, 1500);
                    }}
                    size="sm"
                    LeftAccessory={() => {
                      const spin = rotation.current.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      });
                      return (
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                          <FontAwesome
                            name="refresh"
                            size={24}
                            color="black"
                          />
                        </Animated.View>
                      );
                    }}
                  ></Button>
                </View>

                {stepIndex >= 0 ? (
                  <View style={styles.progressRow}>
                    {CREATE_STEP_ORDER.map((name, index) => {
                      const filled = index <= stepIndex;
                      return (
                        <View
                          key={name}
                          style={[
                            styles.progressSegment,
                            filled && styles.progressSegmentFilled,
                          ]}
                        />
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          },
        }}
      >
        <Stack.Screen
          name="camera"
          options={{ headerShown: false, animation: "fade_from_bottom" }}
        />
      </Stack>

      <BottomSheet
        onClose={closeSheet}
        ref={bottomSheetRef}
        keyboardBlurBehavior="restore"
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onChange={(index) => {
          if (index === -1) {
            closeSheet();
          }
        }}
        bottomInset={bottom}
      >
        {sheetType === "rvt-select" && selectConfig ? (
          <RvtSelectOptionBottomSheetContent
            title={selectConfig.title}
            options={selectConfig.options}
            onSelect={chooseSelectOption}
            selectedId={selectConfig.selectedId}
            enableSearch={selectConfig.enableSearch}
            searchPlaceholder={selectConfig.searchPlaceholder}
          />
        ) : sheetType === "rvt-multi" && multiSelectConfig && renderedMultiItems ? (
          <MultiSelectBottomSheetContent
            title={multiSelectConfig.title}
            items={renderedMultiItems}
            onToggle={toggleMultiSelectOption}
            onConfirm={confirmMultiSelect}
            enableSearch={multiSelectConfig.enableSearch}
            searchPlaceholder={multiSelectConfig.searchPlaceholder}
          />
        ) : sheetType === "rvt-visit-delete-confirm" ? (
          <RvtDeleteConfirmBottomSheetContent
            visitId={visitDeleteId}
            isLoading={isVisitDeletePending}
            onCancel={closeSheet}
            onConfirm={confirmVisitDelete}
          />
        ) : sheetType === "rvt-round-edit" && roundEditConfig ? (
          <RvtRoundEditBottomSheetContent
            nom={roundEditConfig.nom}
            startedAt={roundEditConfig.startedAt}
            onNomChange={(nom) => updateRoundEditDraft({ nom })}
            onStartedAtChange={(startedAt) =>
              updateRoundEditDraft({ startedAt })
            }
            onCancel={closeSheet}
            onConfirm={confirmRoundEdit}
          />
        ) : sheetType === "rvt-round-delete-confirm" && roundDeleteConfig ? (
          <RvtRoundDeleteConfirmBottomSheetContent
            nom={roundDeleteConfig.nom}
            isLoading={isRoundDeletePending}
            onCancel={closeSheet}
            onConfirm={confirmRoundDelete}
          />
        ) : sheetType === "rvt-round-toggle-confirm" && roundToggleConfig ? (
          <RvtRoundToggleConfirmBottomSheetContent
            nom={roundToggleConfig.nom}
            isOpen={roundToggleConfig.isOpen}
            onCancel={closeSheet}
            onConfirm={confirmRoundToggle}
          />
        ) : (
          <View style={styles.sheetFallback}>
            <Text style={styles.sheetFallbackText}>
              Aucune option disponible
            </Text>
          </View>
        )}
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  headerRow: {
    height: 60,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5e7eb",
  },
  progressSegmentFilled: {
    backgroundColor: PRIMARY,
  },
  sheetFallback: {
    padding: 16,
  },
  sheetFallbackText: {
    color: "#888",
  },
});

const headerTitles: Record<string, string> = {
  index: "Rapports de visite",
  "create/client": "Client",
  "create/profil": "Profil terrain",
  "create/marche": "Marché",
  "create/opportunite": "Opportunité",
  "create/action": "Action",
  "details/[visitId]": "Rapport",
  "tours/[roundId]": "Détails de la tournée",
};
