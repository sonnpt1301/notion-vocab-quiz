import chalk from 'chalk';
import dayjs from 'dayjs';
import path from 'path';
import { QUESTION_TYPES, TIME_OPTIONS } from '../constants';
import { QuizQuestion, Word } from '../interfaces';
import { askQuestion, display, shuffleArray } from '../utils/utils';
import { exportToCSV } from './export.service';
import { getWordsFromNotion } from './notion.service';
import { handleQuestion } from './question.service';

export function displayTimeOptions(): void {
  display.title('\n🎮 VOCABULARY LEARNING PROGRAM\n');
  display.question('Choose time range to learn words:');
  TIME_OPTIONS.forEach((option, index) => {
    display.info(chalk.white(`${index + 1}. ${option}`));
  });
}

export function displayQuestionTypeOptions(): void {
  display.question('Choose question type:');
  display.info(chalk.white('1. Random (All types)'));
  Object.values(QUESTION_TYPES).forEach((type, index) => {
    display.info(
      chalk.white(`${index + 2}. ${type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}`),
    );
  });
}

export async function handleQuestionTypeSelection(): Promise<string> {
  const questionType = await askQuestion(chalk.yellow('\n👉 Select question type (1-6): '));
  return questionType;
}

export async function handleTimeSelection(): Promise<string | null> {
  const timeRange = await askQuestion(chalk.yellow('\n👉 Select option (0-7): '));

  if (timeRange === '6') {
    const dateInput = await askQuestion(chalk.yellow('\n👉 Enter date (format: YYYY-MM-DD): '));
    if (!dayjs(dateInput, 'YYYY-MM-DD', true).isValid()) {
      display.error('❌ Invalid date format!');
      return null;
    }
    return dateInput;
  }

  if (timeRange === '7') {
    return 'export';
  }

  if (timeRange === '8') {
    display.info('👋 Goodbye!');
    process.exit(0);
  }

  return timeRange;
}

export async function handleWordLimit(timeRange: string): Promise<number | null> {
  if (timeRange === '1' || timeRange === 'export') {
    return null; // No word limit
  }
  const limit = await askQuestion('👉 Enter number of words to learn: ');
  return parseInt(limit);
}

export function createRandomQuestion(
  wordData: Word,
  index: number,
  total: number,
  allWords: Word[],
  selectedType?: string,
): QuizQuestion {
  // If specific question type is selected (not Random)
  if (selectedType && selectedType !== '1') {
    const typeIndex = parseInt(selectedType) - 2; // Subtract 2 because 1 is Random
    const questionTypes = Object.values(QUESTION_TYPES);
    return {
      type: questionTypes[typeIndex],
      word: wordData,
      index,
      total,
    };
  }

  // Random question type
  const questionTypes = Object.values(QUESTION_TYPES);
  const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  return {
    type: randomType,
    word: wordData,
    index,
    total,
  };
}

export async function runQuiz(): Promise<void> {
  try {
    displayTimeOptions();

    const selectedOption = await handleTimeSelection();
    if (!selectedOption) return;

    const limit = await handleWordLimit(selectedOption);
    const words = await getWordsFromNotion(selectedOption);

    if (words.length === 0) {
      display.error('No words found!');
      return;
    }

    if (selectedOption === 'export') {
      const outputPath = path.join(process.cwd(), `exported-vocab-${dayjs().format('YYYY-MM-DD')}.csv`);
      exportToCSV(words, outputPath);
      display.success(`Exported ${words.length} words to ${outputPath}`);
      return;
    }

    display.success(`Found ${words.length} words to learn!`);

    // Ask for question type
    displayQuestionTypeOptions();
    const questionType = await handleQuestionTypeSelection();

    // Shuffle and get required number of words
    const shuffledWords = shuffleArray(words);
    const wordsToLearn = limit ? shuffledWords.slice(0, limit) : shuffledWords;

    let score = 0;
    for (let i = 0; i < wordsToLearn.length; i++) {
      const question = createRandomQuestion(wordsToLearn[i], i + 1, wordsToLearn.length, words, questionType);

      const isCorrect = await handleQuestion(question, words);
      if (isCorrect) score++;
    }

    display.result(score, wordsToLearn.length);
  } catch (error: any) {
    display.error('An error occurred: ' + error.message);
  }
}
