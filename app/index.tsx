import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function Index() {
  const [currentChapterObj, setCurrentChapterObj] = useState("");
  const [currentChapterText, setCurrentChapterText] = useState("");
  const [currentBookTitle, setCurrentBookTitle] = useState("");
  const [currentChapterNumber, setCurrentChapterNumber] = useState("");

  useEffect(() => {
    fetch(`https://bible.helloao.org/api/eng_kjv/GEN/1.json`)
      .then((request) => request.json())
      .then((chapterObj) => {
        console.log(chapterObj);
        setCurrentChapterObj(chapterObj);

        if (chapterObj?.chapter?.content) {
          const chapterContent = chapterObj.chapter.content;
          // if api returns chapter content, lets serialize the data
          let chapterTextArray = [] // fill the array with each verse of text
          for (let i=0; i < chapterContent.length; i++) {
            chapterTextArray.push(chapterContent[i].number, chapterContent[i].content[0]);
          }

          setCurrentChapterText(chapterTextArray.join(" "))
          if (chapterObj?.book?.name) setCurrentBookTitle(chapterObj.book.name)
          if (chapterObj?.chapter?.number) setCurrentChapterNumber(chapterObj.chapter.number)
          console.log(chapterContent)
        }
      })
      .catch((error) => {
        console.error("Error fetching chapter text:", error);
      });
  }, [currentChapterText]);

  return (
    <ScrollView
      style={styles.viewBox}
    >
      <Text style={styles.bookTitle}>{ currentBookTitle || "loading..."} </Text>
      <Text style={styles.chapterNumber}>{ currentChapterNumber || "loading..."} </Text>
      <Text style={styles.chapterText}>{ currentChapterText || "loading..."} </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  viewBox: {
    display: "flex",
    paddingLeft: '10%',
    paddingRight: '10%'
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
  }

})
