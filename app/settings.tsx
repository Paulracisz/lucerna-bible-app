// app/settings.tsx
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useReader } from "./ReaderContext";
import TopBar from "./TopBar";

type TopBarProps = {
  currentTranslation?: string;
  currentPage?: "home" | "book" | "search" | "bookmark" | "settings";
  openTranslationMenu?: () => void;
};

export default function Settings({
  currentTranslation,
  currentPage,
  openTranslationMenu,
}: TopBarProps) {
  const { fontSize, setFontSize, showWordsOfChrist, setShowWordsOfChrist, showFootnotes, setShowFootnotes, darkMode, setDarkMode } = useReader();

  return (
    <>
      <View style={{ flex: 1 }}>
        <TopBar
          currentTranslation="KJAV"
          currentPage="settings"
          openTranslationMenu={() => {}}
        />
        <View style={styles.verseBox}>
          <Text style={styles.sectionHeader}>Reader Settings</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Font size</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => setFontSize(Math.max(14, fontSize - 2))}
                style={styles.button}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 12 }}>{fontSize}</Text>
              <TouchableOpacity
                onPress={() => setFontSize(Math.min(40, fontSize + 2))}
                style={styles.button}
              >
                <Text>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Words of Christ in red</Text>
            <Switch value={showWordsOfChrist} onValueChange={setShowWordsOfChrist} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Show footnotes</Text>
            <Switch value={showFootnotes} onValueChange={setShowFootnotes} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Dark mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  verseBox: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
    shadowColor: "#000",
    backgroundColor: "white",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
  },
  button: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  verseText: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 10,
    color: "black",
  },
  verseRef: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
    color: "grey",
  },
});
