// Components
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import NavigationBar from "./NavigationBar";

// Misc
import { devMode } from "./config";

// Types
import { ChapterObject, Verse } from "./types";

export default function Index() {
  // current state tracked for rendering text on the page
  const [currentChapterObj, setCurrentChapterObj] =
    useState<ChapterObject | null>(null);
  const [currentChapterTextArray, setCurrentChapterTextArray] = useState<
    Verse[]
  >([]);
  const [currentBookTitle, setCurrentBookTitle] = useState("");
  const [currentChapterNumber, setCurrentChapterNumber] = useState("");

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
    } else if (direction === "next" && totalChapters && (parsedChapter < totalChapters)) {
      newChapter++;
    }

    // convert back to string for state
    setSelectedChapterNumber(newChapter.toString());
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
      <ScrollView style={styles.viewBox}>
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
      />
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
    paddingTop: 20,
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
    marginBottom: 5,
    fontSize: 64,
  },
});
