// app/book.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import TopBar from "./TopBar";
import { Bookmark } from "./types";

type TopBarProps = {
  currentTranslation?: string;
  currentPage: "home" | "book" | "search" | "bookmark" | "settings";
  openTranslationMenu?: () => void;
};

export default function BookScreen({
  currentTranslation,
  currentPage,
  openTranslationMenu,
}: TopBarProps) {
  const [currentBookmarks, setCurrentBookmarks] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const bookmarks = await AsyncStorage.getItem("bookmarks");
        if (bookmarks) {
          const parsedBookmarks = JSON.parse(bookmarks);
          setCurrentBookmarks(parsedBookmarks);
        }
      } catch (e) {
        console.error("Failed to load bookmarks", e);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <View style={{ flex: 1 }}>
        <TopBar
          currentTranslation="KJAV"
          currentPage="bookmark"
          openTranslationMenu={() => {}}
        />
        <View style={styles.verseBox}>
          <Text style={styles.verseText}>Bookmarks</Text>

          {currentBookmarks.length === 0 ? (
            <Text style={styles.verseRef}>No bookmarks yet.</Text>
          ) : (
            currentBookmarks.map((bookmark: Bookmark, index) => (
              <View key={bookmark.id} style={[styles.bookmarkItem]}>
                <Ionicons
                  name="bookmark"
                  size={18}
                  color={bookmark.color}
                  style={{ marginLeft: 5 }}
                />
                <Text style={styles.bookmarkVerse}>
                  {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                </Text>
              </View>
            ))
          )}
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
    marginBottom: 10,
    color: "black",
  },

  verseRef: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    color: "grey",
  },

  bookmarkItem: {
    padding: 12,
    display: "flex",
    flexDirection: "row",
    borderRadius: 8,
    marginBottom: 10,
  },

  bookmarkVerse: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 5,
    color: "#000",
  },
});
