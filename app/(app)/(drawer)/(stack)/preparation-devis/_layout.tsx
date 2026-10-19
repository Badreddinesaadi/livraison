import DevisDateRangeBottomSheetContent from "@/components/DevisDateRangeBottomSheetContent";
import DevisFiltersBottomSheetContent from "@/components/DevisFiltersBottomSheetContent";
import PreparerConfirmBottomSheetContent from "@/components/PreparerConfirmBottomSheetContent";
import ReplaceDevisLotsBottomSheetContent from "@/components/ReplaceDevisLotsBottomSheetContent";
import SelectOptionBottomSheetContent from "@/components/SelectOptionBottomSheetContent";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { usePreparationDevisSheetStore } from "@/stores/preparation-devis.store";
import { FontAwesome } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StackLayout() {
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const sheetType = usePreparationDevisSheetStore((s) => s.sheetType);
  const filtersSheetConfig = usePreparationDevisSheetStore(
    (s) => s.filtersSheetConfig,
  );
  const filterOptionsConfig = usePreparationDevisSheetStore(
    (s) => s.filterOptionsConfig,
  );
  const dateRangeConfig = usePreparationDevisSheetStore(
    (s) => s.dateRangeConfig,
  );
  const preparerConfig = usePreparationDevisSheetStore((s) => s.preparerConfig);
  const replaceLotsConfig = usePreparationDevisSheetStore(
    (s) => s.replaceLotsConfig,
  );
  const isPreparerPending = usePreparationDevisSheetStore(
    (s) => s.isPreparerPending,
  );
  const chooseFilterOption = usePreparationDevisSheetStore(
    (s) => s.chooseFilterOption,
  );
  const applyDateRange = usePreparationDevisSheetStore((s) => s.applyDateRange);
  const confirmPreparer = usePreparationDevisSheetStore(
    (s) => s.confirmPreparer,
  );
  const closeSheet = usePreparationDevisSheetStore((s) => s.closeSheet);
  const isSheetOpen = usePreparationDevisSheetStore((s) => s.isSheetOpen);

  const snapPoints = useMemo(() => {
    if (sheetType === "filter-options") return ["80%"];
    if (sheetType === "date-range") return ["45%"];
    if (sheetType === "preparer-confirm") return ["35%"];
    if (sheetType === "replace-lots") return ["80%"];
    return ["70%"];
  }, [sheetType]);

  const isManagedSheetOpen = isSheetOpen && sheetType !== null;
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
    <GestureHandlerRootView style={{ flex: 1, paddingBottom: bottom }}>
      <Stack
        screenOptions={{
          animation: "ios_from_right",
          header: (s) => (
            <View
              style={{
                marginTop: top,
                height: 60,
                backgroundColor: Colors.light.background,
                padding: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between",
                columnGap: 16,
              }}
            >
              <TouchableWithoutFeedback
                onPress={() => {
                  if (s.route.name === "index") {
                    s.navigation.replace("(app)/(drawer)");
                  } else {
                    s.navigation.goBack();
                  }
                }}
              >
                <FontAwesome name="arrow-left" size={24} color="black" />
              </TouchableWithoutFeedback>
              <Text style={{ fontSize: 20, fontWeight: "700" }}>
                {headerTitles[s.route.name] ?? "Préparation devis"}
              </Text>
              <Button
                preset="ghost"
                onPress={() => {
                  if (isRefreshing) return;
                  setIsRefreshing(true);
                  startSpin();
                  queryClient.invalidateQueries({
                    queryKey: ["preparation-devis"],
                  });
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
                      <FontAwesome name="refresh" size={24} color="black" />
                    </Animated.View>
                  );
                }}
              ></Button>
            </View>
          ),
        }}
      />

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
        {sheetType === "filters" && filtersSheetConfig ? (
          <DevisFiltersBottomSheetContent
            title={filtersSheetConfig.title}
            items={filtersSheetConfig.items}
            onSelectItem={filtersSheetConfig.onSelectItem}
            onReset={filtersSheetConfig.onReset}
          />
        ) : sheetType === "filter-options" && filterOptionsConfig ? (
          <SelectOptionBottomSheetContent
            title={filterOptionsConfig.title}
            options={filterOptionsConfig.options}
            selectedId={filterOptionsConfig.selectedId}
            enableSearch={filterOptionsConfig.enableSearch}
            searchPlaceholder={filterOptionsConfig.searchPlaceholder}
            onSelect={chooseFilterOption}
          />
        ) : sheetType === "date-range" && dateRangeConfig ? (
          <DevisDateRangeBottomSheetContent
            from={dateRangeConfig.from}
            to={dateRangeConfig.to}
            onApply={applyDateRange}
            onClose={closeSheet}
          />
        ) : sheetType === "preparer-confirm" && preparerConfig ? (
          <PreparerConfirmBottomSheetContent
            label={preparerConfig.label}
            type={preparerConfig.type}
            isLoading={isPreparerPending}
            onCancel={closeSheet}
            onConfirm={confirmPreparer}
          />
        ) : sheetType === "replace-lots" && replaceLotsConfig ? (
          <ReplaceDevisLotsBottomSheetContent
            idDevis={replaceLotsConfig.idDevis}
            idProduit={replaceLotsConfig.idProduit}
            productName={replaceLotsConfig.productName}
            currentLot={replaceLotsConfig.currentLot}
            onClose={closeSheet}
          />
        ) : (
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#888" }}>Aucune option disponible</Text>
          </View>
        )}
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const headerTitles: Record<string, string> = {
  index: "Préparation devis",
  "details/[devisId]": "Préparation du devis",
};
