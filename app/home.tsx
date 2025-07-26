// app/book.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import TopBar from "./TopBar";
import { dailyVerses } from "./dailyVerses";

type TopBarProps = {
  currentTranslation?: string;
  currentPage?: "home" | "book" | "search" | "bookmark" | "settings";
  openTranslationMenu?: () => void;
};

export default function BookScreen({
    currentTranslation,
    currentPage,
    openTranslationMenu,
}: TopBarProps) {

    const today = new Date().getDate();
    const verse = dailyVerses[today % dailyVerses.length];

  return (
    <>
<View style={{ flex: 1 }}>
      <TopBar
        currentTranslation="KJAV"
        currentPage="home"
        openTranslationMenu={() => {}}
      />
      <View style={styles.verseBox}>
        <Text style={styles.verseText}>&quot;{verse.text}&quot;</Text>
        <Text style={styles.verseRef}>— {verse.reference}</Text>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  verseBox: {
    padding: 20,
    margin: 20,
    backgroundColor: "#F0F4F8",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  verseText: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 10,
    color: "#333",
  },
  verseRef: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    color: "#666",
  },
});
