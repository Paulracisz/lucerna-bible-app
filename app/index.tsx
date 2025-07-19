// Components
import React, { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import NavigationBar from "./NavigationBar";

// Misc
import { devMode } from "./config";

// Types
import { BookListItem, ChapterObject, Verse } from "./types";

export default function Index() {
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
  const [bookList, setBookList] = useState<BookListItem[]>([]);

  // used to scroll to the top every time a chapter is changed.
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // selected by user and used for API call
  const [selectedTranslation, setSelectedTranslation] = useState("eng_kjv");
  const [selectedCurrentBook, setSelectedCurrentBook] = useState("GEN");
  const [selectedChapterNumber, setSelectedChapterNumber] = useState("1");

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
        scrollToTop();

        // if api returns chapter content, lets serialize the data
        if (chapterObj?.chapter?.content) {
          const chapterContent = chapterObj.chapter.content;

          let chapterTextArray = []; // fill the array with each verse of text

          for (let i = 0; i < chapterContent.length; i++) {
            chapterTextArray.push({
              number: chapterContent[i].number,
              text: chapterContent[i].content[0].replace("¶", "\n \t"),
            });
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
        console.error("Error fetching chapter text:", error);
      });
  };

  const handleChapterChange = (direction: "previous" | "next") => {
    // TODO: handle moving to the next book if going next on the last chapter

    if (direction !== "previous" && direction !== "next") {
      console.error("Invalid direction:", direction);
      return;
    }

    const parsedChapter = parseInt(currentChapterNumber);
    const totalChapters = currentChapterObj?.book?.numberOfChapters;

    if (!parsedChapter || !totalChapters) {
      console.error("Invalid current chapter or total chapters");
    }

    // Check for invalid chapter jumps
    const isFirstBookAndChapter =
      selectedCurrentBook === "GEN" && parsedChapter === 1;
    const isLastBookAndChapter =
      selectedCurrentBook === "REV" && parsedChapter === totalChapters;

    if (
      (direction === "previous" && isFirstBookAndChapter) ||
      (direction === "next" && isLastBookAndChapter)
    ) {
      if (devMode) console.log("Reached the end, not changing chapter.");
    }

    let newChapter = parsedChapter;

    if (direction === "previous" && parsedChapter > 1) {
      newChapter--;
    } else if (
      direction === "next" &&
      totalChapters &&
      parsedChapter < totalChapters
    ) {
      newChapter++;
    }

    // convert back to string for state
    setSelectedChapterNumber(newChapter.toString());
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
            numberOfChapters: book.numberOfChapters
          })
        );
        console.log("booksObj", booksObj);
        console.log("booksArray", booksArray);
        setBookList(booksArray);
      })
      .catch((error) => console.error("Failed to fetch book list:", error));
  };

  useEffect(() => {
    fetchChapterData(
      selectedTranslation,
      selectedCurrentBook,
      selectedChapterNumber
    );
  }, [selectedTranslation, selectedCurrentBook, selectedChapterNumber]);

  return (
    <>
      <ScrollView ref={scrollViewRef} style={styles.viewBox}>
        <Text style={styles.bookTitle}> {currentBookTitle} </Text>
        <Text style={styles.chapterNumber}> {currentChapterNumber} </Text>
        <Text style={styles.chapterText}>
          {currentChapterTextArray.length > 0
            ? currentChapterTextArray.map((verse, index) => (
                <Text key={index}>
                  <Text style={styles.verseNumber}>{verse.number} </Text>
                  <Text style={styles.verseText}>{verse.text + " "}</Text>
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
      />
      <Modal
        animationType="slide"
        transparent={false}
        visible={bookMenuVisible}
        onRequestClose={() => setBookMenuVisible(false)}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>Select Book</Text>
          <ScrollView>
            {bookList.map((book, index) => (
              <Text
                key={index}
                style={{ padding: 10, fontSize: 20 }}
                onPress={() => {
                  setSelectedCurrentBook(book.abbreviation);
                  setSelectedChapterNumber("1");
                  setBookMenuVisible(false);
                  scrollToTop();
                }}
              >
                {book.name}
              </Text>
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
