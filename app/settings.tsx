// app/settings.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
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
  return (
    <>
      <View style={{ flex: 1 }}>
        <TopBar
          currentTranslation="KJAV"
          currentPage="settings"
          openTranslationMenu={() => {}}
        />
        <View style={styles.verseBox}></View>
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
