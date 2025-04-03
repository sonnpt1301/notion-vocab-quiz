import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import chalk from 'chalk';
import { Word } from '../interfaces';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const display = {
  error: (message: string) => console.log(chalk.red(`❌ ${message}`)),
  success: (message: string) => console.log(chalk.green(`✅ ${message}`)),
  info: (message: string) => console.log(chalk.cyan(message)),
  warning: (message: string) => console.log(chalk.yellow(`⚠️ ${message}`)),
  question: (message: string) => console.log(chalk.yellow(`👉 ${message}`)),
  title: (message: string) => console.log(chalk.cyan.bold(message)),
  divider: () => console.log(chalk.cyan('\n' + '═'.repeat(150) + '\n')),
  wordInfo: (wordData: Word) => {
    display.title(
      `\n📝 Question ${wordData.index}/${wordData.total}: ${wordData.questionType === 'fill_in_blank' ? '' : wordData.word}`,
    );
    display.info(`📚 Word Type: ${wordData.category}`);
    if (wordData.createdAt) {
      const formattedDate = dayjs(wordData.createdAt).format('DD/MM/YYYY');
      display.info(`📅 Learned on: ${formattedDate}`);
    }
  },
  options: (options: string[]) => {
    options.forEach((option: string, index: number) => {
      console.log(chalk.white(`${index + 1}. ${option}`));
    });
  },
  additionalInfo: (wordData: Word) => {
    display.info('\n📖 Definition (EN): ' + chalk.white(wordData.definitionEn));
    display.info('📖 Definition (VN): ' + chalk.white(wordData.definitionVn));
    if (wordData.synonyms.length) {
      display.info('🔄 Synonyms: ' + chalk.white(wordData.synonyms.join(', ')));
    }
    if (wordData.example) {
      display.info('💡 Example: ' + chalk.white(wordData.example));
    }
    if (wordData.note) {
      display.info('📌 Note: ' + chalk.white(wordData.note));
    }
  },
  result: (score: number, total: number) => {
    display.title(`\n🎯 You got ${score}/${total} questions correct!`);
    if (score === total) {
      display.success('🌟 Excellent! You completed the quiz perfectly!');
    } else if (score >= total * 0.6) {
      display.success('Good job! Keep up the good work!');
    } else {
      display.warning('💪 Don\'t give up! Try again to improve your score!');
    }
  },
};

// Filter words by Last Reviewed date
export function filterWordsByDate(words: any[], daysAgo: number) {
  if (daysAgo === 0) {
    return words;
  }

  const today = dayjs();
  const targetDate = today.subtract(daysAgo, 'day');

  return words.filter((word) => {
    if (!word.createdAt) return true;
    const reviewDate = dayjs(word.createdAt);
    return reviewDate.isSameOrAfter(targetDate);
  });
}

// Helper function to read input from console
export function askQuestion(query: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    readline.question(query, (answer: string) => {
      readline.close();
      resolve(answer);
    }),
  );
}

// Convert text with diacritics to plain text
export function removeDiacritics(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Check keywords in answer
export function checkKeywords(answer: string, definition: string) {
  // Handle empty inputs
  if (!answer || !definition) {
    return false;
  }

  // Convert both answer and definition to plain text
  const normalizedAnswer = removeDiacritics(answer);
  const normalizedDefinition = removeDiacritics(definition);

  // Split definition into keywords, handle commas and parentheses
  const keywords = new Set(
    normalizedDefinition
      .replace(/[(),]/g, '') // Remove commas and parentheses
      .split(/\s+/) // Split by spaces
      .filter((word) => word.length > 0), // Remove empty words
  );

  // Split answer into words
  const answerWords = new Set(
    normalizedAnswer
      .split(/\s+/) // Split by spaces
      .filter((word) => word.length > 0), // Remove empty words
  );

  // Count matching keywords
  const matchingKeywords = [...keywords].filter((word) => answerWords.has(word)).length;
  const matchingPercentage = keywords.size > 0 ? matchingKeywords / keywords.size : 0;

  // For small definitions (3 words or less), require at least 70% match
  if (keywords.size <= 3) {
    return matchingPercentage >= 0.7;
  }

  // For larger definitions, require at least 3 keywords and 70% match
  return matchingKeywords >= 3 && matchingPercentage >= 0.7;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
