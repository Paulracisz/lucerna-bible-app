import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function Index() {
  // current state tracked for rendering text on the page
  const [currentChapterObj, setCurrentChapterObj] = useState("");
  const [currentChapterText, setCurrentChapterText] = useState("");
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
      return console.error("Invalid params for API call");

    fetch(
      `https://bible.helloao.org/api/${translation}/${book}/${chapter}.json`
    )
      .then((request) => request.json())
      .then((chapterObj) => {
        console.log(chapterObj);

        setCurrentChapterObj(chapterObj);

        // if api returns chapter content, lets serialize the data
        if (chapterObj?.chapter?.content) {
          const chapterContent = chapterObj.chapter.content;

          let chapterTextArray = []; // fill the array with each verse of text

          for (let i = 0; i < chapterContent.length; i++) {
            chapterTextArray.push(
              chapterContent[i].number,
              chapterContent[i].content[0]
            );
          }

          setCurrentChapterText(chapterTextArray.join(" ")); // join together the text and verse numbers

          if (chapterObj?.book?.name) setCurrentBookTitle(chapterObj.book.name);

          if (chapterObj?.chapter?.number)
            setCurrentChapterNumber(chapterObj.chapter.number);
        }
      })
      .catch((error) => {
        console.error("Error fetching chapter text:", error);
      });
  };

  useEffect(() => {
    fetchChapterData(
      selectedTranslation,
      selectedCurrentBook,
      selectedChapterNumber
    );
  }, [selectedTranslation, selectedCurrentBook, selectedChapterNumber]);

  return (
    <ScrollView style={styles.viewBox}>
      <Text style={styles.bookTitle}>{currentBookTitle || "loading..."} </Text>
      <Text style={styles.chapterNumber}>
        {currentChapterNumber || "loading..."}{" "}
      </Text>
      <Text style={styles.chapterText}>
        {currentChapterText || "loading..."}{" "}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  viewBox: {
    display: "flex",
    paddingLeft: "10%",
    paddingRight: "10%",
  },

  chapterText: {
    textAlign: "center",
    lineHeight: 45,
    paddingBottom: 20,
    paddingTop: 20,
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
