// Components
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import NavigationBar from "./NavigationBar";
import TopBar from "./TopBar";

// Misc
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname } from "expo-router";
import { devMode } from "./config";

// Types
import { BookListItem, ChapterObject, Translations, Verse } from "./types";

// TODO
// store current chapter and book in local storage so the bible reader opens up to the last chapter you were reading (and position on the page hopefully)
// add modal for changing translations

export default function Index() {
  const pathname = usePathname();

  let currentPage: "home" | "book" | "search" | "bookmark" | "settings" =
    "home";

  if (pathname.includes("search")) currentPage = "search";
  else if (pathname.includes("settings")) currentPage = "settings";
  else if (pathname.includes("bookmark")) currentPage = "bookmark";
  else if (pathname.includes("book") || pathname === "/") currentPage = "book"; // index is the book reader

  // current state tracked for rendering text on the page
  const [currentChapterObj, setCurrentChapterObj] =
    useState<ChapterObject | null>(null);
  const [currentChapterTextArray, setCurrentChapterTextArray] = useState<
    Verse[]
  >([]);
  const [currentBookTitle, setCurrentBookTitle] = useState("");
  const [currentChapterNumber, setCurrentChapterNumber] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [bookMenuVisible, setBookMenuVisible] = useState(false);
  const [translationMenuVisible, setTranslationMenuVisible] = useState(false);
  const [bookList, setBookList] = useState<BookListItem[]>([]);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // translations
  const [allTranslations, setAllTranslations] = useState<Translations[]>([]);
  const [groupedTranslations, setGroupedTranslations] = useState<
    Record<string, Translations[]>
  >({});
  const [visibleLanguages, setVisibleLanguages] = useState<string[]>([]);
  const batchSize = 5;
  const bookScrollRef = useRef<ScrollView>(null);

  // used to scroll to the top every time a chapter is changed.
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // selected by user and used for API call
  const [selectedTranslation, setSelectedTranslation] = useState("eng_kjv");
  const [translationShortName, setTranslationShortName] = useState("KJAV");
  const [selectedCurrentBook, setSelectedCurrentBook] = useState("GEN");
  const [selectedChapterNumber, setSelectedChapterNumber] = useState("1");

  const currentBookIndex = bookList.findIndex(
    (book) => book.abbreviation === selectedCurrentBook
  );

  const isAtStart = currentBookIndex === 0 && selectedChapterNumber === "1";
  const lastBookIndex = bookList.length - 1;
  const lastChapterOfCurrentBook =
    bookList[currentBookIndex]?.numberOfChapters?.toString();

  const isAtEnd =
    currentBookIndex === lastBookIndex &&
    selectedChapterNumber === lastChapterOfCurrentBook;

  /**
   * Constructs an API call to the Bible API based on parameters that are tracked with useState
   *
   * @async
   * @param {string} translation currently selected bible translation (ex: eng_kjv)
   * @param {string} book currently selected book of the bible (ex: GEN for Genesis)
   * @param {string} chapter current selected chapter of the book (ex: 1 for chapter 1)
   * @returns {console.error} will return a console error if parameters are not passed in correctly
   */
  const fetchChapterData = async (
    translation: string,
    book: string,
    chapter: string
  ) => {
    if (!(translation && book && chapter))
      return console.error("Invalid params for API call.");

    fetch(
      `https://bible.helloao.org/api/${translation}/${book}/${chapter}.json`
    )
      .then((request) => request.json())
      .then((chapterObj) => {
        if (devMode) console.log("dev mode active:", chapterObj);

        setCurrentChapterObj(chapterObj);
        getCurrentBookList();

        // if api returns chapter content, lets serialize the data
        if (chapterObj?.chapter?.content) {
          const chapterContent = chapterObj.chapter.content;

          let chapterTextArray = []; // fill the array with each verse of text

          for (let i = 0; i < chapterContent.length; i++) {
            const item = chapterContent[i];

            // handle headings
            if (item?.type === "heading") {
              chapterTextArray.push({
                number: "",
                heading: "\n" + item.content[0],
                parts: [],
              });
            }

            // handle line_break array elements
            if (item?.type === "line_break") {
              chapterTextArray.push({
                number: "",
                heading: "",
                parts: [{ text: "\n" }],
              });
            }

            // handle verses where paragraph symbols are used as line breaks
            if (item.type !== "verse" || !item.content || !item.number)
              continue;
            const verseParts = item.content;
            if (item.type === "verse") {
              const parts = verseParts.map((part: any) => {
                if (typeof part === "string") {
                  return {
                    text: part.replace(/¶/g, "\n\t"),
                    isJesusWord: false,
                  };
                } else if (typeof part === "object" && part?.text) {
                  return {
                    text: part.text.replace(/¶/g, "\n\t"),
                    isJesusWord: part.wordsOfJesus === true,
                  };
                } else {
                  return { text: "", isJesusWord: false };
                }
              });

              chapterTextArray.push({
                number: item.number,
                heading: "",
                parts,
              });
            }
          }

          if (chapterTextArray) setCurrentChapterTextArray(chapterTextArray);

          if (chapterObj?.book?.name) setCurrentBookTitle(chapterObj.book.name);
          else if (!chapterObj?.book?.name)
            console.error("Book name does not exist.");

          if (chapterObj?.chapter?.number)
            setCurrentChapterNumber(chapterObj.chapter.number);
          else if (!chapterObj?.chapter?.number)
            console.error("Chapter number does not exist.");
        }
      })
      .catch((error) => {
        if (!devMode)
          window.alert(
            "Something seems to have gone wrong when loading the Bible. Please file an error report in the settings:\n" +
              error
          );
        return console.error("Error fetching chapter text:", error);
      });
  };

  const handleChapterChange = (direction: "previous" | "next") => {
    const parsedChapter = parseInt(currentChapterNumber);
    const totalChapters = currentChapterObj?.book?.numberOfChapters;

    if (!parsedChapter || !totalChapters) {
      console.error("Invalid chapter data");
      return;
    }

    const currentBookIndex = bookList.findIndex(
      (book) => book.abbreviation === selectedCurrentBook
    );

    if (currentBookIndex === -1) {
      console.error("Current book not found in list");
      return;
    }

    if (direction === "previous") {
      if (parsedChapter > 1) {
        // Just go back one chapter
        setSelectedChapterNumber((parsedChapter - 1).toString());
      } else if (currentBookIndex > 0) {
        // Go to last chapter of previous book
        const previousBook = bookList[currentBookIndex - 1];
        setSelectedCurrentBook(previousBook.abbreviation);
        setSelectedChapterNumber(previousBook.numberOfChapters.toString());
      } else {
        // Already at Genesis 1, do nothing
        return;
      }
    }

    if (direction === "next") {
      if (parsedChapter < totalChapters) {
        // Go to next chapter
        setSelectedChapterNumber((parsedChapter + 1).toString());
      } else if (currentBookIndex < bookList.length - 1) {
        // Go to next book, chapter 1
        const nextBook = bookList[currentBookIndex + 1];
        setSelectedCurrentBook(nextBook.abbreviation);
        setSelectedChapterNumber("1");
      } else {
        // Already at last book/chapter (Revelation 22), do nothing
        return;
      }
    }

    scrollToTop();
  };

  /**
   * Handles opening of the book menu to select a new book or chapter of the bible.
   *
   * @param {none} none has no parameters
   * @returns {none} returns no value.
   */
  const handleBookMenu = () => {
    setBookMenuVisible(true);
    getCurrentBookList();

    setTimeout(() => {
      const bookIndex = bookList.findIndex(
        (b) => b.abbreviation === selectedCurrentBook
      );

      if (bookIndex !== -1 && bookScrollRef.current) {
        const itemHeight = 60; // the height of the book item
        bookScrollRef.current.scrollTo({
          y: itemHeight * bookIndex,
          animated: true,
        });
      }
    }, 200); // delay so that the modal is visible before the scroll happens
  };

  const handleTranslationMenu = () => {
    setTranslationMenuVisible(true);
    getCurrentTranslationList();
  };

  const getCurrentTranslationList = () => {
    fetch(`https://bible.helloao.org/api/available_translations.json`)
      .then((response) => response.json())
      .then((data) => {
        const translations: Translations[] = data.translations;

        setAllTranslations(translations);

        // Group translations by languageName
        const grouped: Record<string, Translations[]> = {};
        for (const t of translations) {
          const lang = t.languageName || "Other";
          if (!grouped[lang]) grouped[lang] = [];
          grouped[lang].push(t);
        }

        setGroupedTranslations(grouped);
        setVisibleLanguages(Object.keys(grouped).slice(0, batchSize)); // only show 5 at a time
      })
      .catch((error) =>
        console.error("Failed to get list of available translations", error)
      );
  };

  /**
   * Calls the API to get the current list of Bible books for displaying in the book selection menu.
   *
   * @param {none} none has no parameters
   * @returns {} returns an array to be mapped over containing the list of books.
   */
  const getCurrentBookList = () => {
    fetch(`https://bible.helloao.org/api/${selectedTranslation}/books.json`)
      .then((response) => response.json())
      .then((booksObj) => {
        const booksArray: BookListItem[] = Object.values(booksObj.books).map(
          (book: any) => ({
            name: book.commonName,
            abbreviation: book.id,
            numberOfChapters: book.numberOfChapters,
          })
        );
        setBookList(booksArray);
      })
      .catch((error) => console.error("Failed to fetch book list:", error));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem("lastReadLocation");
        const scrollData = await AsyncStorage.getItem("scrollPosition");

        if (savedData) {
          const { book, chapter, translation } = JSON.parse(savedData);
          setSelectedCurrentBook(book || "GEN");
          setSelectedChapterNumber(chapter || "1");
          setSelectedTranslation(translation || "eng_kjv");
        }

        if (scrollData) {
          const { y } = JSON.parse(scrollData);
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          }, 500); // delay so content is loaded before scrollling
        }
      } catch (e) {
        console.error("Failed to load data:", e);
      }
    };

    loadData();
  }, []);

  // used for getting the translation list early to update the translation short name prop for top bar
  useEffect(() => {
    getCurrentTranslationList();
  }, []);

  // update the stale translation short name for top bar
  useEffect(() => {
    const matched = allTranslations.find((t) => t.id === selectedTranslation);
    if (matched) {
      setTranslationShortName(matched.shortName || matched.name);
    }
  }, [selectedTranslation, allTranslations]);

  useEffect(() => {
    fetchChapterData(
      selectedTranslation,
      selectedCurrentBook,
      selectedChapterNumber
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTranslation, selectedCurrentBook, selectedChapterNumber]);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(
          "lastReadLocation",
          JSON.stringify({
            book: selectedCurrentBook,
            chapter: selectedChapterNumber,
            translation: selectedTranslation,
          })
        );
      } catch (e) {
        console.error("Failed to fetch save data:", e);
      }
    };
    saveData();
  }, [selectedCurrentBook, selectedChapterNumber, selectedTranslation]);

  const saveScrollPosition = async (y: number) => {
    try {
      await AsyncStorage.setItem("scrollPosition", JSON.stringify({ y }));
    } catch (e) {
      console.error("Failed to save scroll position:", e);
    }
  };

  return (
    <>
      <TopBar
        currentTranslation={translationShortName}
        currentPage={currentPage}
        openTranslationMenu={handleTranslationMenu}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.viewBox}
        onScroll={({ nativeEvent }) => {
          saveScrollPosition(nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={100}
      >
        <Text style={styles.bookTitle}>{currentBookTitle}</Text>
        <Text style={styles.chapterNumber}>{currentChapterNumber}</Text>
        <Text style={styles.chapterText}>
          {currentChapterTextArray.length > 0
            ? currentChapterTextArray.map((verse, index) => (
                <Text key={index}>
                  <Text>
                    {" "}
                    {verse.heading ? (
                      <Text style={{ fontWeight: "bold", fontSize: 26 }}>
                        {verse.heading + "\n"}
                      </Text>
                    ) : null}{" "}
                  </Text>
                  <Text style={styles.verseNumber}>{verse.number} </Text>
                  {verse.parts.map((part, idx) => (
                    <Text
                      key={idx}
                      style={[
                        styles.verseText,
                        part.isJesusWord && { color: "#d9320e" },
                      ]}
                    >
                      {part.text + " "}
                    </Text>
                  ))}
                </Text>
              ))
            : "loading..."}
        </Text>
      </ScrollView>

      <NavigationBar
        currentBookName={currentBookTitle}
        currentChapter={currentChapterNumber}
        onChapterChange={handleChapterChange}
        openBookMenu={handleBookMenu}
        isAtStart={isAtStart}
        isAtEnd={isAtEnd}
      />
      <Modal
        animationType="slide"
        transparent={false}
        visible={translationMenuVisible}
        onRequestClose={() => setTranslationMenuVisible(false)}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignContent: "space-around",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
              Select Translation
            </Text>
            <Ionicons
              name="close-outline"
              onPress={() => setTranslationMenuVisible(false)}
              size={32}
              color="black"
            />
          </View>

          <TextInput
            placeholder="Search translations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              padding: 10,
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 6,
              marginBottom: 15,
            }}
          />

          <ScrollView
            onScroll={({ nativeEvent }) => {
              const isBottom =
                nativeEvent.layoutMeasurement.height +
                  nativeEvent.contentOffset.y >=
                nativeEvent.contentSize.height - 50;
              if (isBottom) {
                const nextLanguages = Object.keys(groupedTranslations).slice(
                  0,
                  visibleLanguages.length + batchSize
                );
                if (nextLanguages.length > visibleLanguages.length) {
                  setVisibleLanguages(nextLanguages);
                }
              }
            }}
            scrollEventThrottle={16}
          >
            {visibleLanguages
              .filter(
                (langName) =>
                  langName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  groupedTranslations[langName]?.some((translation) =>
                    (translation.name + translation.shortName)
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
              )
              .map((langName) => {
                const filteredTranslations = groupedTranslations[
                  langName
                ].filter(
                  (translation) =>
                    searchQuery === "" ||
                    langName
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) || // search by language
                    (translation.name + translation.shortName)
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) // search by translation
                );

                return (
                  <View key={langName} style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 5,
                      }}
                    >
                      {langName}
                    </Text>
                    {filteredTranslations.map((translation, index) => (
                      <Text
                        key={index}
                        onPress={() => {
                          setSelectedTranslation(translation.id);
                          setTranslationShortName(
                            translation.shortName || translation.name
                          );
                          setTranslationMenuVisible(false);
                          scrollToTop();
                        }}
                        style={{
                          padding: 10,
                          fontSize: 16,
                          backgroundColor: "#eee",
                          marginBottom: 5,
                          borderRadius: 6,
                        }}
                      >
                        {translation.name} ({translation.shortName})
                      </Text>
                    ))}
                  </View>
                );
              })}
          </ScrollView>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={false}
        visible={bookMenuVisible}
        onRequestClose={() => setBookMenuVisible(false)}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignContent: "space-around",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Select Book</Text>
            <Ionicons
              name="close-outline"
              onPress={() => setBookMenuVisible(false)}
              size={32}
              color="black"
            />
          </View>
          <ScrollView ref={bookScrollRef}>
            {bookList.map((book, index) => (
              <View key={index} style={{ marginBottom: 20 }}>
                <Text
                  onPress={() => {
                    setExpandedBook((prev) =>
                      prev === book.abbreviation ? null : book.abbreviation
                    );
                  }}
                  style={{
                    padding: 10,
                    fontSize: 20,
                    fontWeight: "bold",
                    backgroundColor: "#eee",
                  }}
                >
                  {book.name}
                </Text>
                {expandedBook === book.abbreviation && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      paddingHorizontal: 10,
                      marginTop: 5,
                    }}
                  >
                    {Array.from({ length: book.numberOfChapters }, (_, i) => (
                      <Text
                        key={i}
                        onPress={() => {
                          setSelectedCurrentBook(book.abbreviation);
                          setSelectedChapterNumber((i + 1).toString());
                          setBookMenuVisible(false);
                          scrollToTop();
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          textAlign: "center",
                          textAlignVertical: "center",
                          margin: 4,
                          backgroundColor: "#ddd",
                          borderRadius: 6,
                          fontSize: 16,
                        }}
                      >
                        {i + 1}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  viewBox: {
    display: "flex",
    paddingLeft: "10%",
    paddingRight: "10%",
  },

  chapterText: {
    textAlign: "left",
    lineHeight: 45,
    paddingBottom: 20,
    paddingTop: 5,
    fontSize: 24,
  },

  verseLine: {
    textAlign: "left",
    lineHeight: 45,
    fontSize: 24,
  },

  verseNumber: {
    color: "grey",
    fontSize: 15,
  },

  verseText: {
    textAlign: "left",
    fontSize: 24,
  },

  bookTitle: {
    textAlign: "center",
    color: "grey",
    marginTop: 30,
    fontSize: 24,
  },

  chapterNumber: {
    textAlign: "center",
    fontSize: 64,
  },
});
