export type Verse = {
  number: string;
  heading: string;
  parts: VerseContentPart[];
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