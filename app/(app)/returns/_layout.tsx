import ReturnActionConfirmBottomSheetContent from "@/components/ReturnActionConfirmBottomSheetContent";
import SelectOptionBottomSheetContent from "@/components/SelectOptionBottomSheetContent";
import VoyageFiltersBottomSheetContent from "@/components/VoyageFiltersBottomSheetContent";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useCloseBLStore } from "@/stores/close-bl.store";
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
  const sheetType = useCloseBLStore((s) => s.sheetType);
  const selectorSheetConfig = useCloseBLStore((s) => s.selectorSheetConfig);
  const voyageFiltersSheetConfig = useCloseBLStore(
    (s) => s.voyageFiltersSheetConfig,
  );
  const returnActionReturnId = useCloseBLStore((s) => s.returnActionReturnId);
  const isReturnActionPending = useCloseBLStore((s) => s.isReturnActionPending);
  const chooseSelectorOption = useCloseBLStore((s) => s.chooseSelectorOption);
  const chooseVoyageFilterItem = useCloseBLStore(
    (s) => s.chooseVoyageFilterItem,
  );
  const confirmReturnAction = useCloseBLStore((s) => s.confirmReturnAction);
  const closeSheet = useCloseBLStore((s) => s.closeSheet);
  const isSheetOpen = useCloseBLStore((s) => s.isSheetOpen);
  const snapPoints = useMemo(() => {
    if (sheetType === "return-action-confirm") {
      return ["25%"];
    }
    if (sheetType === "voyage-filters") {
      return ["50%"];
    }
    return ["60%"];
  }, [sheetType]);

  const isManagedSheetOpen =
    isSheetOpen &&
    (sheetType === "selector-options" ||
      sheetType === "voyage-filters" ||
      sheetType === "return-action-confirm");
  const { top } = useSafeAreaInsets();
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                    s.navigation.replace("(app)", {});
                  } else {
                    s.navigation.goBack();
                  }
                }}
              >
                <FontAwesome name="arrow-left" size={24} color="black" />
              </TouchableWithoutFeedback>
              <Text style={{ fontSize: 20, fontWeight: "700" }}>
                {headerTitles[s.route.name] ?? "Retours"}
              </Text>
              <Button
                preset="ghost"
                onPress={() => {
                  if (isRefreshing) return;
                  setIsRefreshing(true);
                  startSpin();
                  queryClient.invalidateQueries({ queryKey: ["returns"] });
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
      >
        {sheetType === "selector-options" && selectorSheetConfig ? (
          <SelectOptionBottomSheetContent
            title={selectorSheetConfig.title}
            options={selectorSheetConfig.options}
            selectedId={selectorSheetConfig.selectedId}
            enableSearch={selectorSheetConfig.enableSearch}
            searchPlaceholder={selectorSheetConfig.searchPlaceholder}
            onSelect={chooseSelectorOption}
          />
        ) : sheetType === "voyage-filters" && voyageFiltersSheetConfig ? (
          <VoyageFiltersBottomSheetContent
            title={voyageFiltersSheetConfig.title}
            items={voyageFiltersSheetConfig.items}
            onSelectItem={chooseVoyageFilterItem}
            onReset={voyageFiltersSheetConfig.onReset}
          />
        ) : sheetType === "return-action-confirm" ? (
          <ReturnActionConfirmBottomSheetContent
            returnId={returnActionReturnId}
            isLoading={isReturnActionPending}
            onCancel={closeSheet}
            onConfirm={confirmReturnAction}
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
  index: "List des retours",
  "create/index": "Créer un retour",
  "details/[returnId]": "Détails du retour",
};
