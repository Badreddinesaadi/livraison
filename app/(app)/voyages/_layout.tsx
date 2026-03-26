import CloseBLBottomSheetContent from "@/components/CloseBLBottomSheetContent";
import SelectOptionBottomSheetContent from "@/components/SelectOptionBottomSheetContent";
import { Button } from "@/components/ui/button";
import VoyageActionConfirmBottomSheetContent from "@/components/VoyageActionConfirmBottomSheetContent";
import VoyageFiltersBottomSheetContent from "@/components/VoyageFiltersBottomSheetContent";
import VoyageMoreActionsBottomSheetContent from "@/components/VoyageMoreActionsBottomSheetContent";
import { Colors } from "@/constants/theme";
import { useCloseBLStore } from "@/stores/close-bl.store";
import { useCreateVoyageStore } from "@/stores/voyage.store";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
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
import Toast from "react-native-toast-message";

export default function StackLayout() {
  const queryClient = useQueryClient();
  const Type = useCreateVoyageStore((state) => state.type);
  const idVoyage = useCreateVoyageStore((state) => state.idVoyage);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const closeBLVoyageId = useCloseBLStore((s) => s.voyageId);
  const closeBLList = useCloseBLStore((s) => s.bls);
  const sheetType = useCloseBLStore((s) => s.sheetType);
  const voyageActionType = useCloseBLStore((s) => s.voyageActionType);
  const chooseMoreAction = useCloseBLStore((s) => s.chooseMoreAction);
  const selectorSheetConfig = useCloseBLStore((s) => s.selectorSheetConfig);
  const voyageFiltersSheetConfig = useCloseBLStore(
    (s) => s.voyageFiltersSheetConfig,
  );
  const chooseSelectorOption = useCloseBLStore((s) => s.chooseSelectorOption);
  const chooseVoyageFilterItem = useCloseBLStore(
    (s) => s.chooseVoyageFilterItem,
  );

  const snapPoints = useMemo(() => {
    if (sheetType === "voyage-action-confirm") {
      return [voyageActionType === "achever" ? "45%" : "23%"];
    } else if (sheetType === "voyage-more-actions") {
      return ["30%"];
    } else if (sheetType === "voyage-filters") {
      return ["55%"];
    } else if (sheetType === "selector-options") {
      return ["60%"];
    } else {
      return ["50%"];
    }
  }, [sheetType, voyageActionType]);
  const pendingUndeliveredCount = useCloseBLStore(
    (s) => s.pendingUndeliveredCount,
  );
  const voyageKmDepart = useCloseBLStore((s) => s.voyageKmDepart);
  const voyageDateDepart = useCloseBLStore((s) => s.voyageDateDepart);
  const isSheetOpen = useCloseBLStore((s) => s.isSheetOpen);
  const isVoyageActionPending = useCloseBLStore((s) => s.isVoyageActionPending);
  const closeSheet = useCloseBLStore((s) => s.closeSheet);
  const confirmVoyageAction = useCloseBLStore((s) => s.confirmVoyageAction);
  const selectAllCloseBL = useCloseBLStore((s) => s.selectAll);
  const selectSingleCloseBL = useCloseBLStore((s) => s.selectBL);
  const router = useRouter();

  useEffect(() => {
    if (isSheetOpen) {
      bottomSheetRef.current?.snapToIndex(0);
      return;
    }
    bottomSheetRef.current?.close();
  }, [isSheetOpen]);

  const handleSelectAllBLs = () => {
    selectAllCloseBL();
    Toast.show({
      type: "success",
      text1: "Clôture BL",
      text2: `Voyage #${closeBLVoyageId}: tous les BLs sélectionnés`,
    });
    closeSheet();
  };

  const handleSelectBL = (blId: number) => {
    const selectedBL = closeBLList.find((bl) => bl.id === blId);
    if (!selectedBL) {
      return;
    }
    selectSingleCloseBL(selectedBL);
    closeSheet();
    router.navigate({
      pathname: "/voyages/action-bl/[blId]",
      params: { blId: String(selectedBL.id) },
    });
  };

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
                <FontAwesome5 name="arrow-left" size={24} color="black" />
              </TouchableWithoutFeedback>
              <Text style={{ fontSize: 20, fontWeight: "700" }}>
                {headerTitles[s.route.name] ??
                  (Type === "create"
                    ? "Créer un voyage"
                    : "Modifier le voyage #" + idVoyage)}
              </Text>
              <Button
                preset="ghost"
                onPress={() => {
                  if (isRefreshing) return;
                  setIsRefreshing(true);
                  startSpin();
                  queryClient.invalidateQueries();
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
              {/* <Text style={{ fontSize: 8 }}>{"DEBUG: " + s.route.name}</Text> */}
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
        {sheetType === "voyage-action-confirm" && voyageActionType ? (
          <VoyageActionConfirmBottomSheetContent
            variant={voyageActionType}
            voyageId={closeBLVoyageId}
            pendingUndeliveredCount={pendingUndeliveredCount}
            kmDepart={voyageKmDepart}
            minDateRetour={voyageDateDepart}
            isLoading={isVoyageActionPending}
            onCancel={closeSheet}
            onConfirm={confirmVoyageAction}
          />
        ) : sheetType === "voyage-more-actions" ? (
          <VoyageMoreActionsBottomSheetContent
            voyageId={closeBLVoyageId}
            onUpdate={() => chooseMoreAction("modifier")}
            onShowDetails={() => chooseMoreAction("details")}
          />
        ) : sheetType === "selector-options" && selectorSheetConfig ? (
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
        ) : (
          <CloseBLBottomSheetContent
            bls={closeBLList}
            onSelectAll={handleSelectAllBLs}
            onSelectBL={handleSelectBL}
          />
        )}
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const headerTitles: Record<string, string> = {
  chauffeur: "Remplir les donnes du voyage",
  "select-bls": "Sélectionner les BLs",
  photo: "Récapitulatif du voyage",
  index: "List des voyages",
  "action-bl/[blId]": "Action sur le BL",
  "details/[voyageId]": "Détails du voyage",
};
