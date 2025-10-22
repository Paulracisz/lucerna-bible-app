// src/context/ReaderContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import { FootnotesMap } from "./types";


type ReaderContextType = {
  /** Selected book abbreviation, e.g. "GEN" */
  selectedCurrentBook: string;
  setSelectedCurrentBook: (book: string) => void;

  /** Selected chapter number as string, e.g. "1" */
  selectedChapterNumber: string;
  setSelectedChapterNumber: (chapter: string) => void;

  /** Visibility of the *book‑menu* modal that lives in Index */
  bookMenuVisible: boolean;
  setBookMenuVisible: (visible: boolean) => void;

  selectedTranslation: string;
  setSelectedTranslation: (translation: string) => void;

  translationShortName: string;
  setTranslationShortName: (translationShortName: string) => void;

  saveScrollPosition: (y: number) => void;

  footnotesMap: FootnotesMap;
  setFootnotesMap: Dispatch<SetStateAction<FootnotesMap>>;

  footnotesReady: boolean;

  readerReady: boolean;
};

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export const useReader = (): ReaderContextType => {
  const ctx = useContext(ReaderContext);
  if (!ctx) {
    throw new Error("useReader must be used within a ReaderProvider");
  }
  return ctx;
};

export const ReaderProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCurrentBook, setSelectedCurrentBook] = useState<string>("GEN");
  const [selectedChapterNumber, setSelectedChapterNumber] =
    useState<string>("1");
  const [bookMenuVisible, setBookMenuVisible] = useState<boolean>(false);
  const [selectedTranslation, setSelectedTranslation] =
    useState<string>("bsb");
  const [translationShortName, setTranslationShortName] =
    useState<string>("BSB");

  const isInitializing = useRef(true);
  const [readerReady, setReaderReady] = useState(false);

  const [footnotesMap, setFootnotesMap] = useState<FootnotesMap>({});
  const [footnotesReady, setFootnotesReady] = useState(false);

  const saveScrollPosition = async (y: number) => {
    try {
      await AsyncStorage.setItem("scrollPosition", JSON.stringify({ y }));
    } catch (e) {
      console.error("Failed to save scroll position:", e);
    }
  };

  /* -------------------------------------------------
     persist the last‑read location so the
     app remembers where the user left off.
   ------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem("lastReadLocation");
        if (saved) {
          const { book, chapter, translation, footnotes } = JSON.parse(saved);
          if (book) setSelectedCurrentBook(book);
          if (chapter) setSelectedChapterNumber(chapter);
          if (translation) setSelectedTranslation(translation);
          if (footnotes) setFootnotesMap(footnotes as FootnotesMap);
        }
      } catch (e) {
        console.error("Failed to load data:", e);
      } finally {
        isInitializing.current = false;
        setReaderReady(true);
        setFootnotesReady(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (isInitializing.current) return;
    const save = async () => {
      try {
        await AsyncStorage.setItem(
          "lastReadLocation",
          JSON.stringify({
            book: selectedCurrentBook,
            chapter: selectedChapterNumber,
            translation: selectedTranslation,
            footnotes: footnotesMap,
          })
        );
      } catch (e) {
        console.error("Failed to save data:", e);
      }
    };
    save();
  }, [
    selectedCurrentBook,
    selectedChapterNumber,
    selectedTranslation,
    footnotesMap
  ]);

  const contextValue = React.useMemo(
    () => ({
      selectedCurrentBook,
      setSelectedCurrentBook,
      selectedChapterNumber,
      setSelectedChapterNumber,
      bookMenuVisible,
      setBookMenuVisible,
      selectedTranslation,
      setSelectedTranslation,
      translationShortName,
      setTranslationShortName,
      saveScrollPosition,
      readerReady,
      footnotesMap,
      setFootnotesMap,
      footnotesReady,
      setFootnotesReady
    }),
    [
      selectedCurrentBook,
      selectedChapterNumber,
      bookMenuVisible,
      selectedTranslation,
      translationShortName,
      readerReady,
      footnotesMap,
      footnotesReady
    ]
  );

  return (
    <ReaderContext.Provider value={contextValue}>
      {children}
    </ReaderContext.Provider>
  );
};
