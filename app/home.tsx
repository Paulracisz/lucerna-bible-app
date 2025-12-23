// app/book.tsx
import React from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const today = new Date();
  const dateSeed = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

  // hashing function
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const seededIndex = Math.abs(hashCode(dateSeed)) % dailyVerses.length;
  const verse = dailyVerses[seededIndex];

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
          <View style={styles.row}>
            <Text style={styles.verseRef}>— {verse.reference}</Text>
            <TouchableOpacity
              onPress={async () => {
                const message = `${verse.text}\n— ${verse.reference}`;
                try {
                  await Share.share({ message });
                } catch (e) {
                  console.error("Share failed:", e);
                }
              }}
              style={styles.shareButton}
            >
              <Text style={{ color: "#007aff", fontWeight: "600" }}>Share</Text>
            </TouchableOpacity>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shareButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
