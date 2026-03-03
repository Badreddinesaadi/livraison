import { listBLSEnCours } from "@/api/BLS.api";
import { Colors } from "@/constants/theme";
import { useBlsStore } from "@/stores/bls.store";
import { BL } from "@/types/BL";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const CreateVoyageScreen = () => {
  const { data } = useQuery({ queryKey: ["voyages"], queryFn: listBLSEnCours });
  const bls = useBlsStore();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Créer un voyage {data?.length}</Text>
        {/* <TextInput style={styles.input} placeholder="Nom du voyage" /> */}
        <FlatList
          data={data}
          keyExtractor={(bl, i) => bl.id.toString() + i}
          renderItem={({ item: bl }) => (
            <BLCard
              key={bl.id}
              bl={bl}
              selected={bls.bls?.some((b) => b.id === bl.id)}
              addBls={bls.addBls}
              removeBL={bls.removeBL}
            />
          )}
        />
      </View>
      <View>
        <Button
          disabled={!bls.bls || bls.bls.length === 0}
          color={Colors.light.primary}
          title="Créer le voyage"
          onPress={() => {
            router.push("/voyages/create/photo");
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const BLCard = ({
  bl,
  selected,
  addBls,
  removeBL,
}: {
  bl: BL;
  selected: boolean | undefined;
  addBls: (newBls: BL[]) => void;
  removeBL: (blId: number) => void;
}) => {
  return (
    <View style={[styles.card, selected ? styles.selectedCard : null]}>
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.cardTitle}>{bl.name}</Text>
        <Text>{bl.date}</Text>
        <Text>{bl.status}</Text>
      </View>
      <Button
        title={selected ? "Désélectionner" : "Sélectionner"}
        onPress={() => {
          if (selected) {
            removeBL(bl.id);
          } else {
            addBls([bl]);
          }
        }}
        color={Colors.light.primary}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  selectedCard: {
    backgroundColor: Colors.light.primary,
    color: "white",
  },
});
