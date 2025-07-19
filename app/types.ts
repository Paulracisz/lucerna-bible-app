export type Verse = {
  number: string;
  text: string;
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
      content: string[];
    }[];
  };
};

export type BookListItem = {
  name: string;
  abbreviation: string;
}