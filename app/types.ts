export type Verse = {
  number: string;
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
}

export type VerseContentPart = {
  text: string;
  isJesusWord: boolean;
}