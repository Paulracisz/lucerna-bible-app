import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Misc

type TopBarProps = {
  currentTranslation: string;
  currentPage: "home" | "book" | "search" | "bookmark" | "settings";
  openTranslationMenu: () => void;
};

export default function TopBar({
  currentTranslation,
  currentPage,
  openTranslationMenu,
}: TopBarProps) {

  const router = useRouter();

  return (
    <>
      <View style={styles.topBarBox}>
        <Ionicons
          name="home"
          onPress={() => router.push("/home")}
          style={[styles.homeIcon, currentPage === "home" && styles.activeIcon]}
        ></Ionicons>
        <Ionicons
          style={[styles.homeIcon, currentPage === "book" && styles.activeIcon]}
          onPress={() => router.push("/")}
          name="book"
        ></Ionicons>
        <Ionicons
          style={[
            styles.homeIcon,
            currentPage === "search" && styles.activeIcon,
          ]}
          name="search"
        ></Ionicons>
        <Ionicons
          style={[
            styles.homeIcon,
            currentPage === "bookmark" && styles.activeIcon,
          ]}
          name="bookmark"
        ></Ionicons>
        <Ionicons
          style={[
            styles.homeIcon,
            currentPage === "settings" && styles.activeIcon,
          ]}
          name="settings"
        ></Ionicons>
        {currentPage === "book" && (
        <TouchableOpacity
          style={styles.translationBox}
          onPress={() => openTranslationMenu()}
        >
          <Text>{currentTranslation}</Text>
        </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topBarBox: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    height: 65,
    paddingTop: 15,
    marginTop: 0,
    borderBottomColor: "#D9D9D9",
    borderBottomWidth: 1,
    backgroundColor: "white",
    position: "sticky",
    bottom: 0,
  },

  translationBox: {
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    textAlign: "center",
    fontSize: 16,
    margin: 5,
    padding: 8,
    borderColor: "grey",
    borderRadius: 500,
    borderWidth: 1,
  },

  activeIcon: {
    backgroundColor: "#D9D9D9",
    borderRadius: 10,
    padding: 5,
  },

  homeIcon: {
    fontSize: 30,
    margin: 5,
  },
});
