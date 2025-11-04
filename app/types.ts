export type Verse = {
  number: string;
  heading: string;
  parts: VerseContentPart[];
  footnote?: { label: string; text: string };
};

export type ChapterObject = {
  book: {
    name: string;
    numberOfChapters: number;
  };
  chapter: {
    number: string;
    content: {
      number: number;
      content: (string | {
        text: string;
        wordsOfJesus?: boolean;
      })[];
    }[];
  };
};

export type BookListItem = {
  name: string;
  abbreviation: string;
  numberOfChapters: number;
}

export type AvailableTranslationListItem = {
  translations: Translations[];
}

export type Translations = {
  name: string;
  id: string;
  shortName: string;
  language: string;
  languageEnglishName: string;
  englishName: string;
  [key: string]: any
}

export type VerseContentPart = {
  text: string;
  isJesusWord: boolean;
}

export type Bookmark = {
  id: string;
  book: string;
  name: string;
  translationId: string;
  translationShortName: string;
  scrollY: number;
  chapter: string;
  verse: string;
  color: string;
}

export type Highlight = {
  id: string;
  book: string;
  name: string;
  translationId: string;
  translationShortName: string;
  scrollY: number;
  chapter: string;
  verse: string;
  color: string;
}

export type FootnoteEntry = {
  label: string;
  text: string;
}

export type FootnotesMap = Record<string, FootnoteEntry>;

export const DOWNLOADED_TRANSLATIONS: Translations[] = [
  {
    name: "Berean Standard Bible",
    id: "BSB",
    shortName: "BSB",
    language: "eng",
    languageEnglishName: "English",
    englishName: "Berean Standard Bible",
    key: ""
  },
  {
    name: "King James Authorized Version",
    id: "eng_kjv",
    shortName: "KJAV",
    language: "English",
    languageEnglishName: "King James Version",
    englishName: "King James (Authorized) Version",
    key: ""
  },
  // 👉 Add more entries here if you ship additional offline packs
];