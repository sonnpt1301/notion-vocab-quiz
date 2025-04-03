interface Word {
  word: string;
  definitionVn: string;
  definitionEn: string;
  example: string;
  synonyms: string[];
  category: string;
  createdAt: string | null;
  note: string;
  index?: number;
  total?: number;
  questionType?: string;
}

interface NotionProperties {
  Word: {
    title: Array<{
      text: {
        content: string;
      };
    }>;
  };
  'Definition (VN)': {
    rich_text: Array<{
      text: {
        content: string;
      };
    }>;
  };
  'Definition (EN)': {
    rich_text: Array<{
      text: {
        content: string;
      };
    }>;
  };
  Example: {
    rich_text: Array<{
      text: {
        content: string;
      };
    }>;
  };
  Synonyms: {
    rich_text: Array<{
      text: {
        content: string;
      };
    }>;
  };
  Category: {
    select: {
      name: string;
    };
  };
  'Created time': {
    created_time: string;
  };
  Note: {
    rich_text: Array<{
      text: {
        content: string;
      };
    }>;
  };
}

export { NotionProperties, Word };
