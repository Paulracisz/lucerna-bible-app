// Components
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useReader } from "./ReaderContext";

// Misc
import { Ionicons } from "@expo/vector-icons";

type NavigationBarProps = {
  currentBookName: string;
  currentChapter: string;
  onChapterChange: (direction: "previous" | "next") => void;
  openBookMenu: () => void;
  isAtStart: boolean;
  isAtEnd: boolean;
};

export default function NavigationBar({
  currentBookName,
  currentChapter,
  onChapterChange,
  openBookMenu,
  isAtStart,
  isAtEnd,
}: NavigationBarProps) {
  /**
   * On press function for the two arrows on the bottom navigation bar for the bible reader page.
   *
   * @param {string} direction whether or not we are going forward or backwards a chapter. ex: ("previous" or "next")
   */
  const handleChapterArrowPress = (direction: "previous" | "next") => {
    onChapterChange(direction);
  };

  return (
    (() => {
      const { darkMode } = useReader();
      return (
        <View style={[styles.navigationBox, { backgroundColor: darkMode ? "#1a1a1a" : "white", borderTopColor: darkMode ? "#2b2b2b" : "#D9D9D9" }]}>
          <View style={[styles.chapterNavigationBox, { backgroundColor: darkMode ? "#2b2b2b" : "#F2F2F2" }]}>
            <TouchableOpacity
              onPress={() => !isAtStart && handleChapterArrowPress("previous")}
              disabled={isAtStart}
            >
              <Ionicons name="chevron-back" size={32} color={isAtStart ? "gray" : (darkMode ? "#eee" : "black")} />
            </TouchableOpacity>

            <Text
              style={[styles.currentBookNameStyle, { color: darkMode ? "#fff" : "black", backgroundColor: darkMode ? "#2b2b2b" : "#F2F2F2" }]}
              onPress={() => openBookMenu()}
            >
              {currentBookName} {currentChapter}
            </Text>

            <TouchableOpacity
              onPress={() => !isAtEnd && handleChapterArrowPress("next")}
              disabled={isAtEnd}
            >
              <Ionicons name="chevron-forward" size={32} color={isAtEnd ? "gray" : (darkMode ? "#eee" : "black")} />
            </TouchableOpacity>
          </View>
        </View>
      );
    })()
  );
}

const styles = StyleSheet.create({
  navigationBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 65,
    borderTopColor: "#D9D9D9",
    borderTopWidth: 1,
    backgroundColor: "white",
    position: "sticky",
    bottom: 0,
  },

  chapterNavigationBox: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    textAlign: "center",
    padding: 10,
    color: "black",
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 500,
  },

  currentBookNameStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    textAlign: "center",
    color: "black",
    fontSize: 25,
  },
});
