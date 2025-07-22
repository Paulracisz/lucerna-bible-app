import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

// Misc

type TopBarProps = {
  currentTranslation: string;
};

export default function TopBar({ currentTranslation }: TopBarProps) {
  return (
    <>
      <View style={styles.topBarBox}>
        <Ionicons name="home" style={styles.homeIcon}></Ionicons>
        <Ionicons style={styles.homeIcon} name="book"></Ionicons>
        <Ionicons style={styles.homeIcon} name="search"></Ionicons>
        <Ionicons style={styles.homeIcon} name="bookmark"></Ionicons>
        <Ionicons style={styles.homeIcon} name="settings"></Ionicons>
        <View style={styles.translationBox}>
          <Text style={styles.translationText}> {currentTranslation} </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topBarBox: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    height: 65,
    paddingTop: 15,
    marginTop: 0,
    borderBottomColor: "#D9D9D9",
    borderBottomWidth: 1,
    backgroundColor: "white",
    position: "sticky",
    bottom: 0,
  },

  translationBox: {
    backgroundColor: "#F2F2F2",
    width: 55,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    margin: 5,
    borderColor: "#D9D9D9",
    borderRadius: 500,
    borderWidth: 1,
  },

  translationText: {
    textAlign: "center",
    fontSize: 16,
  },

  homeIcon: {
    fontSize: 30,
    margin: 5,
  }

});
