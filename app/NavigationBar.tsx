import { StyleSheet, Text, View } from "react-native";

type NavigationBarProps = {
  currentBookName: string;
  currentChapter: string;
};

export default function NavigationBar({
  currentBookName,
  currentChapter,
}: NavigationBarProps) {
  return (
    <View style={styles.navigationBox}>
      <Text style={styles.currentBookNameStyle}>
        {currentBookName} {currentChapter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 65,
    borderTopColor: "#D9D9D9",
    borderTopWidth: 1,
    backgroundColor: "white",
    position: "sticky",
    bottom: 0,
  },

  currentBookNameStyle: {
    backgroundColor: "#F2F2F2",
    padding: 10,
    color: "black",
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 500,
    fontSize: 25,
  },
});
