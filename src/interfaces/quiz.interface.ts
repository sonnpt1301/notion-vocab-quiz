import { Word } from './word.interface';

export interface QuizQuestion {
  type: string;
  word: Word;
  index: number;
  total: number;
}
