import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function Index() {
  const [currentChapterObj, setCurrentChapterObj] = useState("");
  const [currentChapterText, setCurrentChapterText] = useState("");

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
      <Text style={styles.chapterText}>{ currentChapterText || "Chapter text loading..."} </Text>
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
    fontSize: 24,
  }

})
