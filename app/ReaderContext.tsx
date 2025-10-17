// src/context/ReaderContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

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
    useState<string>("eng_kjv");
  const [translationShortName, setTranslationShortName] =
    useState<string>("KJAV");

  const saveScrollPosition = async (y: number) => {
    try {
      await AsyncStorage.setItem("scrollPosition", JSON.stringify({ y }));
    } catch (e) {
      console.error("Failed to save scroll position:", e);
    }
  };

  /* -------------------------------------------------
     OPTIONAL: persist the last‑read location so the
     app remembers where the user left off.
   ------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem("lastReadLocation");
        if (saved) {
          const { book, chapter } = JSON.parse(saved);
          if (book) setSelectedCurrentBook(book);
          if (chapter) setSelectedChapterNumber(chapter);
        }
      } catch (_) {}
    };
    load();
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(
          "lastReadLocation",
          JSON.stringify({
            book: selectedCurrentBook,
            chapter: selectedChapterNumber,
            translation: selectedTranslation,
          })
        );
      } catch (_) {}
    };
    save();
  }, [selectedCurrentBook, selectedChapterNumber, selectedTranslation]);

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
    }),
    [
      selectedCurrentBook,
      selectedChapterNumber,
      bookMenuVisible,
      selectedTranslation,
      translationShortName,
    ]
  );

  return (
    <ReaderContext.Provider value={contextValue}>
      {children}
    </ReaderContext.Provider>
  );
};
