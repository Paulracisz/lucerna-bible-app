// Components
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    <View style={styles.navigationBox}>
      <View style={styles.chapterNavigationBox}>
        <TouchableOpacity
          onPress={() => !isAtStart && handleChapterArrowPress("previous")}
          disabled={isAtStart}
        >
          <Ionicons name="chevron-back" size={32} color={isAtStart ? "gray" : "black"} />
        </TouchableOpacity>

        <Text
          style={styles.currentBookNameStyle}
          onPress={() => openBookMenu()}
        >
          {currentBookName} {currentChapter}
        </Text>

        <TouchableOpacity
          onPress={() => !isAtEnd && handleChapterArrowPress("next")}
          disabled={isAtEnd}
        >
          <Ionicons name="chevron-forward" size={32} color={isAtEnd ? "gray" : "black"} />
        </TouchableOpacity>
      </View>
    </View>
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
