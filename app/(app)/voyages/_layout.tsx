import CloseBLBottomSheetContent from "@/components/CloseBLBottomSheetContent";
import VoyageActionConfirmBottomSheetContent from "@/components/VoyageActionConfirmBottomSheetContent";
import VoyageMoreActionsBottomSheetContent from "@/components/VoyageMoreActionsBottomSheetContent";
import { Colors } from "@/constants/theme";
import { useCloseBLStore } from "@/stores/close-bl.store";
import { useCreateVoyageStore } from "@/stores/voyage.store";
import { FontAwesome5 } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function StackLayout() {
  const Type = useCreateVoyageStore((state) => state.type);
  const idVoyage = useCreateVoyageStore((state) => state.idVoyage);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const closeBLVoyageId = useCloseBLStore((s) => s.voyageId);
  const closeBLList = useCloseBLStore((s) => s.bls);
  const sheetType = useCloseBLStore((s) => s.sheetType);
  const voyageActionType = useCloseBLStore((s) => s.voyageActionType);
  const chooseMoreAction = useCloseBLStore((s) => s.chooseMoreAction);

  const snapPoints = useMemo(() => {
    if (sheetType === "voyage-action-confirm") {
      return ["23%"];
    } else if (sheetType === "voyage-more-actions") {
      return ["30%"];
    } else {
      return ["50%"];
    }
  }, [sheetType]);
  const pendingUndeliveredCount = useCloseBLStore(
    (s) => s.pendingUndeliveredCount,
  );
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
                alignItems: "flex-end",
                flexDirection: "row",
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
              {/* <Text style={{ fontSize: 8 }}>{"DEBUG: " + s.route.name}</Text> */}
            </View>
          ),
        }}
      />

      <BottomSheet
        ref={bottomSheetRef}
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
