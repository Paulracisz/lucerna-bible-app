import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useReader } from "./ReaderContext";
import TopBar from "./TopBar";

type TopBarProps = {
  currentTranslation?: string;
  currentPage?: "home" | "book" | "search" | "bookmark" | "settings";
  openTranslationMenu?: () => void;
};

export default function Search({
  currentTranslation,
  currentPage,
  openTranslationMenu,
}: TopBarProps) {
  const router = useRouter();
  const { setSelectedCurrentBook, setSelectedChapterNumber, setSelectedTranslation, setTranslationShortName, saveScrollPosition } = useReader();
  const [bibleSearchQuery, setBibleSearchQuery] = useState("");
  const [results, setResults] = useState<VerseMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Trigger a search after the user pauses typing (debounced)
  useEffect(() => {
    if (!bibleSearchQuery) {
      setResults([]);
      return;
    }

    const normalized = bibleSearchQuery.trim();
    // Avoid searching for extremely short queries
    if (normalized.length < 2) {
      setResults([]);
      return;
    }

    const DEBOUNCE_MS = 400;
    let handler: ReturnType<typeof setTimeout>;

    handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const translation = currentTranslation ?? "BSB";
        const matches = await searchBibleAllBooks(bibleSearchQuery, translation);
        setResults(matches);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [bibleSearchQuery, currentTranslation]);

  return (
    <>
      <ScrollView style={{ flex: 1 }}>
        <TopBar
          currentTranslation="KJAV"
          currentPage="search"
          openTranslationMenu={() => {}}
        />
        <View style={styles.verseBox}>

            <Text style={styles.sectionHeader}>Search</Text>
          <TextInput
            placeholder="Search the Bible..."
            value={bibleSearchQuery}
            onChangeText={setBibleSearchQuery}
            style={{
              padding: 10,
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 6,
              marginBottom: 15,
            }}
          />

          {/* ---------- Results rendering ---------- */}
          {isLoading ? (
            <Text>Searching…</Text>
          ) : (
              results.map((m, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    // TEMP LOG: user tapped search result
                    console.log("[DEBUG] search result tap ->", m.bookId, m.chapter, m.verse, m.translationShortName);
                    // Set reader context and navigate to reader (index)
                    setSelectedCurrentBook(m.bookId);
                    setSelectedChapterNumber(m.chapter);
                    if (m.translationId) setSelectedTranslation(m.translationId);
                    if (m.translationShortName) setTranslationShortName(m.translationShortName);
                    // Navigate to the chapter; do not attempt automated scrolling.
                    saveScrollPosition(0);
                    router.replace("/");
                  }}
                  style={{ marginBottom: 12 }}
                >
                  <Text style={{ fontWeight: "bold" }}>
                    {m.book} {m.chapter}:{m.verse}
                  </Text>
                  <Text>{m.text}</Text>
                </Pressable>
              ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

  const loadLocalJson = async (path: string) => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return response.json();
  };

// ------------------------------------------------------------
// Helper: searchBible (adapted for per‑book JSON files)
// ------------------------------------------------------------
type VerseMatch = {
  /** Book identifier, e.g. "1CH" */
  book: string;

  bookId: string;
  /** Chapter number (as a string for consistency with UI) */
  chapter: string;
  /** Verse number within the chapter (1‑based) */
  verse: string;
  /** Full verse text */
  text: string;
  translationId?: string;
  translationShortName?: string;
};

/**
 * Searches a single book’s JSON file for verses containing `query`.
 *
 * @param query               The user‑typed search term (case‑insensitive).
 * @param translationShortName Short name used in the path, e.g. "KJAV".
 * @param bookId               The three‑letter book code, e.g. "1CH".
 * @returns                    An array of matching verses; empty if none match.
 *
 * @example
 * const hits = await searchBible('faith', 'KJAV', 'ROM');
 * // → [{ bookId: 'ROM', chapter: '1', verse: '5', text: '...faith...' }]
 */
// NOTE: the single-book search implementation was inlined into
// `searchBibleAllBooks` below so we no longer export a separate
// `searchBible` function. This keeps public surface area minimal.

/**
 * Search every book JSON for a translation using the provided index file.
 * Loads `<translationShortName>books.json` from the translation folder
 * and queries each book file in parallel.
 */
export async function searchBibleAllBooks(
  query: string,
  translationShortName: string,
): Promise<VerseMatch[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  // Attempt to load the translation's book index (e.g. /databases/KJAV/KJAVbooks.json)
  const indexPath = `/databases/${translationShortName}/${translationShortName}books.json`;
  let indexData: any[] = [];
  try {
    indexData = await loadLocalJson(indexPath);
  } catch (err) {
    return [];
  }

  // Build a map of book id -> readable book name from the index
  const bookNameMap: Record<string, string> = {};
  const bookIds: string[] = Array.isArray(indexData)
    ? indexData.map((b) => {
        const id = b.id;
        const name = b.commonName || b.name || b.title || id;
        if (id) bookNameMap[id] = name;
        return id;
      }).filter(Boolean)
    : [];

  const matches: VerseMatch[] = [];

  // Try to interpret the query as a book/chapter[:verse] reference.
  const parseReference = (q: string): { bookId: string; chapter: number; verse?: number } | null => {
    const m = q.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
    if (!m) return null;
    const rawBook = m[1].trim();
    const chapter = Number(m[2]);
    const verse = m[3] ? Number(m[3]) : undefined;

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[\.,;:\-_'"\(\)\[\]]+/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const bookToken = normalize(rawBook);

    const candidates = indexData as any[];
    for (const b of candidates) {
      const id = String(b.id || "");
      const names = [b.commonName, b.name, b.title, id].filter(Boolean).map(normalize);
      if (names.some((n) => n === bookToken)) return { bookId: id, chapter, verse };
    }

    for (const b of candidates) {
      const id = String(b.id || "");
      const names = [b.commonName, b.name, b.title, id].filter(Boolean).map(normalize);
      if (names.some((n) => n.startsWith(bookToken) || n.startsWith(bookToken.slice(0, 3)))) return { bookId: id, chapter, verse };
    }

    return null;
  };

  const ref = parseReference(query);
  const idsToSearch = ref ? [ref.bookId] : bookIds;

  // Iterate books sequentially to avoid overwhelming the filesystem/network.
  // If performance becomes an issue we can add batching or parallelism.
  for (const id of idsToSearch) {
    try {
      const filePath = `/databases/${translationShortName}/books/${id}.json`;
      const rawData = await loadLocalJson(filePath);
      const entries: any[] = Array.isArray(rawData) ? rawData : [];

      const verseCounters: Record<string, number> = {};

      for (const entry of entries) {
        const chapterStr = String(entry.chapterNumber);
        if (!(chapterStr in verseCounters)) verseCounters[chapterStr] = 0;

        let parts: any[];
        try {
          parts = JSON.parse(entry.contentJson);
        } catch {
          continue;
        }

        const verseText = parts
          .map((p) => (typeof p === "string" ? p : p && typeof p.text === "string" ? p.text : ""))
          .join("")
          .trim();

        const verseNum = entry.number != null ? Number(entry.number) : ++verseCounters[chapterStr];

        if (!verseText) continue;

        if (ref) {
          const needChapter = ref.chapter === Number(chapterStr);
          const needVerse = ref.verse == null || ref.verse === verseNum;
          if (needChapter && needVerse) {
            const bookKey = (entry.bookId ?? id) as string;
            const idxEntry = (indexData as any[]).find((b) => b.id === bookKey) || {};
            matches.push({
              bookId: bookKey,
              book: bookNameMap[bookKey] ?? entry.book ?? bookKey,
              chapter: chapterStr,
              verse: String(verseNum),
              text: verseText,
              translationId: idxEntry.translationId ?? idxEntry["id:1"],
              translationShortName: idxEntry.shortName ?? idxEntry.shortName,
            });
            if (ref.verse != null) return matches;
          }
        } else {
          if (verseText.toLowerCase().includes(normalizedQuery)) {
            const bookKey = (entry.bookId ?? id) as string;
            const idxEntry = (indexData as any[]).find((b) => b.id === bookKey) || {};
            matches.push({
              bookId: bookKey,
              book: bookNameMap[bookKey] ?? entry.book ?? bookKey,
              chapter: chapterStr,
              verse: String(verseNum),
              text: verseText,
              translationId: idxEntry.translationId ?? idxEntry["id:1"],
              translationShortName: idxEntry.shortName ?? idxEntry.shortName,
            });
          }
        }
      }
    } catch (err) {
      // skip this book on error and continue
      continue;
    }
  }

  return matches;
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
