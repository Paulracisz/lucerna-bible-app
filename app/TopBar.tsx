import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useReader } from "./ReaderContext";

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
  const { darkMode } = useReader();

  return (
    <>
      <View style={[
        styles.topBarBox,
        { backgroundColor: darkMode ? "#1a1a1a" : "white", borderBottomColor: darkMode ? "#2b2b2b" : "#D9D9D9" }
      ]}>
        <Ionicons
          name="home"
          onPress={() => router.push("/home")}
          style={[styles.homeIcon, currentPage === "home" && styles.activeIcon, { backgroundColor: currentPage === "home" ? (darkMode ? "#333" : "#D9D9D9") : "transparent" }]}
          color={darkMode ? "#eee" : undefined}
        />
        <Ionicons
          style={[styles.homeIcon, currentPage === "book" && styles.activeIcon, { backgroundColor: currentPage === "book" ? (darkMode ? "#333" : "#D9D9D9") : "transparent" }]}
          onPress={() => router.push("/")}
          name="book"
          color={darkMode ? "#eee" : undefined}
        />
        <Ionicons
          style={[styles.homeIcon, currentPage === "search" && styles.activeIcon, { backgroundColor: currentPage === "search" ? (darkMode ? "#333" : "#D9D9D9") : "transparent" }]}
          onPress={() => router.push("/search")}
          name="search"
          color={darkMode ? "#eee" : undefined}
        />
        <Ionicons
          style={[styles.homeIcon, currentPage === "bookmark" && styles.activeIcon, { backgroundColor: currentPage === "bookmark" ? (darkMode ? "#333" : "#D9D9D9") : "transparent" }]}
          onPress={() => router.push("/bookmark")}
          name="bookmark"
          color={darkMode ? "#eee" : undefined}
        />
        <Ionicons
          style={[styles.homeIcon, currentPage === "settings" && styles.activeIcon, { backgroundColor: currentPage === "settings" ? (darkMode ? "#333" : "#D9D9D9") : "transparent" }]}
          onPress={() => router.push("/settings")}
          name="settings"
          color={darkMode ? "#eee" : undefined}
        />
        {currentPage === "book" && (
          <TouchableOpacity
            style={[styles.translationBox, { backgroundColor: darkMode ? "#2b2b2b" : "#F2F2F2" }]}
            onPress={() => openTranslationMenu()}
          >
            <Text style={{ color: darkMode ? "#fff" : undefined }}>{currentTranslation}</Text>
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
