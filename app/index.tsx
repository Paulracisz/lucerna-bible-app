import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

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
            chapterTextArray.push(chapterContent[i].content[0]);
          }

          setCurrentChapterText(chapterTextArray.join(" "))
          console.log(currentChapterText, "array of chapter text")
        }
      })
      .catch((error) => {
        console.error("Error fetching chapter text:", error);
      });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{ currentChapterText || "Chapter text loading..."} </Text>
    </View>
  );
}
