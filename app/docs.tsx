// src/app/Docs.tsx
import React, { useRef, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Logo from "../assets/images/logo.png";
import { useReader } from "./ReaderContext";

/**
 * Helper to store the Y offset of each section so the TOC can scroll to it.
 */
type SectionPositions = Record<string, number>;

export default function Docs() {
  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<SectionPositions>({});
  const { darkMode } = useReader();

  /** Scroll to a named section */
  const scrollTo = (key: string) => {
    const y = positions.current[key];
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  };

  /** Capture the layout Y coordinate of a section */
  const onSectionLayout = (key: string) => (event: any) => {
    const { y } = event.nativeEvent.layout;
    positions.current[key] = y;
  };

  /** Which collapsible section is currently open (null = none) */
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (key: string) =>
    setOpenSection((prev) => (prev === key ? null : key));

  /* --------------------------------------------------------------- */
  /* Table‑of‑contents – quick navigation links                      */
  /* --------------------------------------------------------------- */
  const tocItems = [
    { key: "intro", label: "Introduction" },
    { key: "usage", label: "How To Use" },
    { key: "api", label: "API Overview" },
    { key: "faq", label: "FAQ" },
  ];

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.root, { backgroundColor: darkMode ? "#0b0b0b" : "#fff" }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, styles.centerText, { color: darkMode ? "#fff" : undefined }]}>Lucerna Bible Documentation</Text>

      {/* ----------------------- LOGO ----------------------- */}
      <Image source={Logo} style={styles.logo} />

      {/* ----------------------- TOC ------------------------ */}
      <View style={styles.tocContainer}>
        <Text style={[styles.tocHeader, { color: darkMode ? "#fff" : undefined }]}>Contents</Text>
        {tocItems.map((item) => (
          <TouchableOpacity key={item.key} onPress={() => scrollTo(item.key)} style={styles.tocItem}>
            <Text style={[styles.tocText, { color: darkMode ? "#66aaff" : "#0066cc" }]}>• {item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ----------------------- INTRODUCTION ----------------------- */}
      <View onLayout={onSectionLayout("intro")} style={styles.section}>
        <Text style={[styles.header, { color: darkMode ? "#fff" : undefined }]}>Introduction</Text>
        <Text style={[styles.paragraph, { color: darkMode ? "#ddd" : undefined }]}>
          Lucerna Bible is a modern, privacy‑first reading platform that lets
          you explore biblical texts offline, annotate verses, and sync securely
          across devices. This guide walks you through the core concepts and
          typical workflows.
        </Text>
      </View>

      {/* ----------------------- HOW TO USE (collapsible) ----------------------- */}
      <View onLayout={onSectionLayout("usage")} style={styles.section}>
        <TouchableOpacity onPress={() => toggle("usage")} activeOpacity={0.7} style={styles.collapseHeader}>
          <Text style={[styles.header, { color: darkMode ? "#fff" : undefined }]}>How To Use</Text>
        </TouchableOpacity>

        {openSection === "usage" && (
          <View style={styles.subContent}>
            <Text style={[styles.paragraph, { color: darkMode ? "#ddd" : undefined }]}>
              1️⃣ <Text style={styles.bold}>Open the app</Text> – After installing, launch Lucerna Bible and sign in with your account.
            </Text>
            <Text style={[styles.paragraph, { color: darkMode ? "#ddd" : undefined }]}>
              2️⃣ <Text style={styles.bold}>Select a version</Text> – Tap the “Versions” tab, browse the catalogue, and download the translation you prefer.
            </Text>
            <Text style={[styles.paragraph, { color: darkMode ? "#ddd" : undefined }]}>
              3️⃣ <Text style={styles.bold}>Read & annotate</Text> – Swipe to turn pages, tap a verse to highlight, and add personal notes. All data stays on your device.
            </Text>
          </View>
        )}
      </View>

      {/* ----------------------- API OVERVIEW (collapsible) ----------------------*/}
      <View onLayout={onSectionLayout("api")} style={styles.section}>
        <TouchableOpacity onPress={() => toggle("api")} activeOpacity={0.7} style={styles.collapseHeader}>
          <Text style={[styles.header, { color: darkMode ? "#fff" : undefined }]}>API Overview</Text>
        </TouchableOpacity>

        {openSection === "api" && (
          <View style={styles.subContent}>
            <Text style={[styles.paragraph, { color: darkMode ? "#ddd" : undefined }]}>
              Lucerna uses the Free Use Bible API (https://bible.helloao.org/docs/) and provides offline-ready JSON databases for bundled translations.
            </Text>
            <Text style={[styles.codeBlock, { backgroundColor: darkMode ? "#222" : "#f5f5f5", color: darkMode ? "#ddd" : undefined }]}>
{`fetch(https://bible.helloao.org/api/{selectedTranslation}/books.json)
  .then((response) => response.json())
  .then((booksObj) => { /* ... */ })`}
            </Text>
          </View>
        )}
      </View>

      {/* ----------------------- FAQ (simple, non‑collapsible) ----------------------- */}
      <View onLayout={onSectionLayout("faq")} style={styles.section}>
        <Text style={[styles.header, { color: darkMode ? "#fff" : undefined }]}>FAQ</Text>

        <Text style={[styles.paragraph, { color: darkMode ? "#ddd" : undefined }]}>
          <Text style={styles.bold}>Q:</Text> Can I use Lucerna offline?
          {'\n'}
          <Text style={styles.bold}>A:</Text> Yes – once a version is downloaded, all reading and annotation features work without an internet connection.
        </Text>

        <Text style={[styles.paragraph, { color: darkMode ? "#ddd" : undefined }]}>
          <Text style={styles.bold}>Q:</Text> Is my data really private?
          {'\n'}
          <Text style={styles.bold}>A:</Text> All notes, highlights, and bookmarks are stored locally only on your devices.
        </Text>
      </View>

      {/* Bottom padding so the last section isn’t clipped */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* --------------------------------------------------------------- */
/* Styles – keep them simple, readable, and consistent             */
/* --------------------------------------------------------------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 20, paddingTop: 30 },

  logo: { width: 250, height: 250, alignSelf: "center", marginBottom: 20 },

  tocContainer: { marginBottom: 25 },
  tocHeader: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  tocItem: { paddingVertical: 4 },
  tocText: { fontSize: 16, color: "#0066cc" },

  section: { marginBottom: 30 },

  header: { fontSize: 28, fontWeight: "600", marginBottom: 10 },

  centerText: { textAlign: "center" },

  collapseHeader: { paddingVertical: 4 }, // makes the touch area a bit larger

  subContent: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#ddd",
    marginTop: 8,
  },

  paragraph: { fontSize: 16, lineHeight: 24, marginBottom: 12 },

  bold: { fontWeight: "600" },

  codeBlock: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 4,
    marginVertical: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});