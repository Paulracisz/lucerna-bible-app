// app/book.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useReader } from "./ReaderContext";
import TopBar from "./TopBar";
import { Bookmark } from "./types";

export default function BookMark() {
  const [currentBookmarks, setCurrentBookmarks] = useState<Bookmark[]>([]);
  const { setSelectedCurrentBook, setSelectedChapterNumber, setSelectedTranslation, setTranslationShortName, saveScrollPosition } = useReader();
  const router = useRouter();

  /* -------------------------------------------------
     Load bookmarks once when the screen mounts
   ------------------------------------------------- */
useEffect(() => {
  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem("bookmarks");
      if (raw) {
        const parsed = JSON.parse(raw).map((b: any) => ({
          ...b,
          translationId: b.translationId ?? "eng_kjv",
          translationShortName: b.translationShortName ?? "KJAV",
        }));
        setCurrentBookmarks(parsed);
      }
    } catch (e) {
      console.error("Failed to load bookmarks", e);
    }
  };
  loadData();
}, []);

  

  /* -------------------------------------------------
     Delete a bookmark – updates AsyncStorage **and** UI
   ------------------------------------------------- */
  const deleteBookMark = async (id: string) => {
    try {
      // 1️⃣  Get the current list from storage (guard against stale UI)
      const raw = await AsyncStorage.getItem("bookmarks");
      const stored: Bookmark[] = raw ? JSON.parse(raw) : [];

      // 2️⃣  Filter out the one we want to delete
      const updated = stored.filter((bm) => bm.id !== id);

      // 3️⃣  Write the new list back to AsyncStorage
      await AsyncStorage.setItem("bookmarks", JSON.stringify(updated));

      // 4️⃣  Immediately reflect the change in the component state
      setCurrentBookmarks(updated);
    } catch (e) {
      console.error("Failed to delete bookmark", e);
    }
  };

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
            currentBookmarks.map((bookmark) => (
              <View key={bookmark.id} style={styles.rowContainer}>
                {/* ----------  Jump to the verse  ---------- */}
                <Pressable
                  style={styles.bookmarkItem}
                  onPress={() => {
                    setSelectedCurrentBook(bookmark.book);
                    setSelectedChapterNumber(bookmark.chapter);
                    setSelectedTranslation(bookmark.translationId);
                    setTranslationShortName(bookmark.translationShortName);
                    saveScrollPosition(bookmark.scrollY);
                    router.replace("/");
                  }}
                >
                  <Ionicons
                    name="bookmark"
                    size={18}
                    color={bookmark.color}
                    style={{ marginLeft: 5 }}
                  />
                  <Text style={styles.bookmarkVerse}>
                    {bookmark.name} {bookmark.chapter}:{bookmark.verse} {bookmark.translationShortName}
                  </Text>
                </Pressable>

                {/* ----------  Delete the bookmark  ---------- */}
                <Pressable
                  style={styles.trashButton}
                  onPress={() => deleteBookMark(bookmark.id)}
                >
                  <Ionicons
                    name="trash"
                    size={18}
                    color="#b00"
                  />
                </Pressable>
              </View>
            ))
          )}
        </View>
      </View>
    </>
  );
}

/* -------------------------------------------------
   Styles – only minor tweaks to line‑up the trash icon
   ------------------------------------------------- */
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
    textAlign: "left",
    color: "grey",
  },

  /* Row that holds the bookmark + trash icon */
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // pushes trash to the far right
    marginBottom: 8,
  },

  bookmarkItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // take remaining horizontal space
    padding: 12,
    borderRadius: 8,
  },

  bookmarkVerse: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 5,
    color: "#000",
  },

  trashButton: {
    padding: 12,
  },
});
