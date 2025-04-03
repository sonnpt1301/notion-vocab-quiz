import chalk from 'chalk';
import { QUESTION_TYPES } from '../constants';
import { QuizQuestion, Word } from '../interfaces';
import { askQuestion, checkKeywords, display } from '../utils/utils';

// Function to create multiple choice question
export function createMultipleChoice(
  wordData: Word,
  allWords: Word[],
): {
  options: string[];
  correctIndex: number;
} {
  // Get all other words excluding the current word
  const otherWords = allWords.filter((w) => w.word !== wordData.word);

  // Create unique options by combining definition and word
  const uniqueOptions = new Set<string>();
  uniqueOptions.add(wordData.definitionVn);

  // Add other words' definitions with their words to make them unique
  const shuffledWords = otherWords.sort(() => Math.random() - 0.5);
  for (const word of shuffledWords) {
    if (uniqueOptions.size >= 4) break;

    // If the definition is the same as the correct answer, skip it
    if (word.definitionVn === wordData.definitionVn) continue;

    // Add the definition with the word to make it unique
    uniqueOptions.add(`${word.definitionVn} (${word.word})`);
  }

  // If we still need more options, add variations of existing options
  const baseOptions = Array.from(uniqueOptions);
  let counter = 1;
  while (uniqueOptions.size < 4) {
    const baseOption = baseOptions[Math.floor(Math.random() * baseOptions.length)];
    if (baseOption !== wordData.definitionVn) {
      uniqueOptions.add(`${baseOption} (${counter})`);
      counter++;
    }
  }

  // Convert to array and shuffle
  const options = Array.from(uniqueOptions);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Find the index of the correct answer
  const correctIndex = options.indexOf(wordData.definitionVn);

  return {
    options,
    correctIndex,
  };
}

// Function to handle multiple choice question
export async function handleMultipleChoice(options: string[], correctIndex: number) {
  display.info('\n🔍 Choose the correct answer:');
  display.options(options);

  let answeredCorrectly = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!answeredCorrectly && attempts < maxAttempts) {
    attempts++;
    try {
      const answer = await askQuestion(chalk.yellow('👉 Choose an answer: '));
      const answerIndex = parseInt(answer) - 1;

      if (isNaN(answerIndex)) {
        display.error('Please enter a number');
        continue;
      }

      if (answerIndex < 0 || answerIndex >= options.length) {
        display.error(`Please choose an answer from 1 to ${options.length}`);
        continue;
      }

      if (answerIndex === correctIndex) {
        display.success('Correct!');
        answeredCorrectly = true;
      } else {
        display.error('Wrong! Try again!');
      }

      if (attempts >= maxAttempts && !answeredCorrectly) {
        display.info('\n💡 Correct answer: ' + options[correctIndex]);
      }
    } catch (error: any) {
      display.error('Please enter a number');
    }
  }
  return answeredCorrectly;
}

// Function to create synonym question
export function createSynonymQuestion(
  wordData: Word,
  allWords: Word[],
): {
  options: string[];
  correctIndex: number;
} {
  if (!wordData.synonyms.length) {
    return {
      options: [],
      correctIndex: -1,
    };
  }

  // Randomly choose a synonym as the correct answer
  const correctSynonym = wordData.synonyms[Math.floor(Math.random() * wordData.synonyms.length)];

  // Get synonyms from other words as wrong answers
  const otherWords = allWords.filter((w) => w !== wordData);
  const wrongSynonyms = new Set(
    otherWords.flatMap((w) => w.synonyms || []).filter((s) => !wordData.synonyms.includes(s)), // Remove duplicate synonyms
  );

  // Create answer list with unique options
  const options = [correctSynonym];

  // Add wrong synonyms (up to 3)
  const shuffledWrongSynonyms = Array.from(wrongSynonyms).sort(() => Math.random() - 0.5);
  for (let i = 0; i < 3 && i < shuffledWrongSynonyms.length; i++) {
    options.push(shuffledWrongSynonyms[i]);
  }

  // If we don't have enough wrong synonyms, add more from the current word's synonyms
  const remainingSynonyms = wordData.synonyms.filter((s) => s !== correctSynonym);
  while (options.length < 4 && remainingSynonyms.length > 0) {
    const randomSynonym = remainingSynonyms.splice(Math.floor(Math.random() * remainingSynonyms.length), 1)[0];
    options.push(randomSynonym);
  }

  // Shuffle answers
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Find the correct answer
  const correctIndex = options.indexOf(correctSynonym);

  return { options, correctIndex };
}

// Function to handle synonym question
export async function handleSynonymQuestion(options: string[], correctIndex: number): Promise<boolean> {
  display.info('\n🔍 Choose the synonym for the given word:');
  display.options(options);

  let answeredCorrectly = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!answeredCorrectly && attempts < maxAttempts) {
    attempts++;
    try {
      const answerIndex = parseInt(await askQuestion(chalk.yellow('👉 Choose a synonym: '))) - 1;
      if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
        display.error(`Please choose an answer from 1 to ${options.length}`);
        continue;
      }
      if (answerIndex === correctIndex) {
        display.success('Correct!');
        answeredCorrectly = true;
      } else {
        display.error('Wrong! Try again!');
      }
      if (attempts >= maxAttempts && !answeredCorrectly) {
        display.info('\n💡 Correct answer: ' + options[correctIndex]);
      }
    } catch (error: any) {
      display.error('Please enter a valid number');
    }
  }
  return answeredCorrectly;
}

// Function to normalize special characters
function normalizeText(text: string): string {
  return text
    .replace(/['']/g, "'") // Normalize single quotes
    .replace(/[""]/g, '"') // Normalize double quotes
    .replace(/[…]/g, '...') // Normalize ellipsis
    .replace(/[–—]/g, '-') // Normalize dashes
    .replace(/\s+/g, ' ') // Normalize spaces (multiple spaces to single space)
    .replace(/['']/g, "'") // Only normalize quotes for display
    .replace(/’/g, "'") // Normalize curly quotes
    .trim() // Remove leading/trailing spaces
    .toLowerCase();
}

// Function to create matching question
export function createMatchingQuestion(
  wordData: Word,
  allWords: Word[],
): {
  words: string[];
  definitions: string[];
  correctIndex: number;
} {
  // Get 3 other words to create the question
  const otherWords = allWords
    .filter((w) => w.word !== wordData.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Create word and definition lists
  const words = [wordData.word, ...otherWords.map((w) => w.word)];
  const definitions = [wordData.definitionVn, ...otherWords.map((w) => w.definitionVn)];

  // Shuffle the order
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }

  for (let i = definitions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [definitions[i], definitions[j]] = [definitions[j], definitions[i]];
  }

  return {
    words,
    definitions,
    correctIndex: definitions.indexOf(wordData.definitionVn),
  };
}

// Function to handle matching question
export async function handleMatchingQuestion(questionData: {
  words: string[];
  definitions: string[];
  correctIndex: number;
}): Promise<boolean> {
  display.info('\n🔍 Match the word with the corresponding definition:');
  display.options(questionData.definitions);

  let answeredCorrectly = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!answeredCorrectly && attempts < maxAttempts) {
    attempts++;
    try {
      const answerIndex =
        parseInt(await askQuestion(chalk.yellow('👉 Choose the number corresponding to the first word: '))) - 1;
      if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= questionData.definitions.length) {
        display.error(`Please choose a number from 1 to ${questionData.definitions.length}`);
        continue;
      }
      if (answerIndex === questionData.correctIndex) {
        display.success('Correct!');
        answeredCorrectly = true;
      } else {
        display.error('Wrong! Try again!');
      }
      if (attempts >= maxAttempts && !answeredCorrectly) {
        display.info('\n💡 Correct answer: ' + questionData.definitions[questionData.correctIndex]);
      }
    } catch (error: any) {
      display.error('Please enter a valid number');
    }
  }
  return answeredCorrectly;
}

// Function to handle keyword check question
export async function handleKeywordCheck(wordData: Word): Promise<boolean> {
  display.info(
    '\n🔍 Enter the definition of the word (you can enter without diacritics and it does not need to be 100% accurate):',
  );

  let answeredCorrectly = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!answeredCorrectly && attempts < maxAttempts) {
    attempts++;
    const answer = await askQuestion(chalk.yellow('👉 Enter the definition: '));
    if (checkKeywords(answer, wordData.definitionVn)) {
      display.success('Correct! You got the main idea!');
      answeredCorrectly = true;
    } else {
      display.error('Not correct! Try again!');
    }
    if (attempts >= maxAttempts && !answeredCorrectly) {
      display.info('\n💡 Correct answer: ' + wordData.definitionVn);
    }
  }
  return answeredCorrectly;
}

interface Question {
  type: 'fill-in-blank';
  sentence: string;
  options: string[];
  correctAnswer: string;
}

// Function to generate options for fill-in-blank questions
const generateOptions = (correctAnswer: string, usedWords: Word[]): string[] => {
  const options = [correctAnswer];
  // Add more options here if needed
  return options;
};

export const createFillInBlankQuestion = (wordData: Word, usedWords: Word[]): Question => {
  const { word, definitionEn, example } = wordData;
  const sentence = example || definitionEn;

  // For phrases like "give a lift back", we need to handle the entire phrase
  if (word.includes(' ')) {
    // Split the phrase into words
    const words = word.split(' ');
    const firstWord = words[0];
    const restOfPhrase = words.slice(1).join(' ');

    // Create patterns for verb conjugations
    const verbPatterns = [
      firstWord, // base form
      `${firstWord}s`, // third person singular
      `${firstWord}ing`, // present participle
      `${firstWord}ed`, // past tense
      // Handle irregular forms
      ...(firstWord === 'give' ? ['gave', 'given'] : []),
      ...(firstWord === 'take' ? ['took', 'taken'] : []),
      ...(firstWord === 'run' ? ['ran', 'run'] : []),
      ...(firstWord === 'go' ? ['went', 'gone'] : []),
    ];

    // Create patterns for the entire phrase
    const phrasePatterns = verbPatterns.map((verb) => {
      // For each verb form, create patterns with optional pronouns
      const pronouns = ['me', 'you', 'him', 'her', 'us', 'them'];
      const pronounPattern = `(?:\\s+(?:${pronouns.join('|')}))?`;
      return `${verb}${pronounPattern}\\s+${restOfPhrase}`;
    });

    // Create regex pattern that matches any of the phrase patterns
    const regex = new RegExp(`\\b(?:${phrasePatterns.join('|')})\\b`, 'gi');

    // Replace the phrase with underscores
    let blankSentence = sentence;
    const matches = sentence.match(regex);
    if (matches) {
      // Sort matches by length (longest first) to handle overlapping matches
      matches.sort((a, b) => b.length - a.length);
      for (const match of matches) {
        blankSentence = blankSentence.replace(match, '_____');
      }
    }

    return {
      type: 'fill-in-blank',
      sentence: blankSentence,
      options: generateOptions(word, usedWords),
      correctAnswer: word,
    };
  }

  // Handle single words
  const baseForm = word.toLowerCase();
  const patterns = [
    baseForm, // base form
    // Handle words ending in 'e'
    /e$/.test(baseForm) ? `${baseForm.slice(0, -1)}ing` : undefined,
    /e$/.test(baseForm) ? `${baseForm.slice(0, -1)}ed` : undefined,
    // Handle words ending in 'y' after consonant
    /[^aeiou]y$/.test(baseForm) ? `${baseForm.slice(0, -1)}ies` : undefined,
    /[^aeiou]y$/.test(baseForm) ? `${baseForm.slice(0, -1)}ied` : undefined,
    // Handle words ending in 'ie'
    /ie$/.test(baseForm) ? `${baseForm.slice(0, -2)}ying` : undefined,
    // Handle words ending in 'c'
    /c$/.test(baseForm) ? `${baseForm}king` : undefined,
    /c$/.test(baseForm) ? `${baseForm}ked` : undefined,
    // Handle doubled consonant + 'ing'/'ed'
    /[^aeiou][aeiou][^aeiou]$/.test(baseForm) ? `${baseForm}${baseForm.slice(-1)}ing` : undefined,
    /[^aeiou][aeiou][^aeiou]$/.test(baseForm) ? `${baseForm}${baseForm.slice(-1)}ed` : undefined,
    // Regular forms
    `${baseForm}ing`,
    `${baseForm}ed`,
    `${baseForm}s`,
    // Handle 'es' suffix for words ending in 's', 'sh', 'ch', 'x', 'z'
    /[sxz]$|[cs]h$/.test(baseForm) ? `${baseForm}es` : undefined,
    // Handle irregular forms
    ...(baseForm === 'go' ? ['went', 'gone'] : []),
    ...(baseForm === 'run' ? ['ran', 'run'] : []),
    ...(baseForm === 'take' ? ['took', 'taken'] : []),
    ...(baseForm === 'give' ? ['gave', 'given'] : []),
    ...(baseForm === 'brownnose' ? ['brownnosing'] : []),
    ...(baseForm === 'overstep' ? ['overstepped'] : []),
    ...(baseForm === 'snore' ? ['snores'] : []),
  ].filter((v): v is string => v !== undefined);

  // Create regex pattern that matches the word in various forms
  const regex = new RegExp(`\\b(?:${patterns.join('|')})\\b`, 'gi');

  // Replace the word with underscores
  let blankSentence = sentence;
  const matches = sentence.match(regex);
  if (matches) {
    // Sort matches by length (longest first) to handle overlapping matches
    matches.sort((a, b) => b.length - a.length);
    for (const match of matches) {
      blankSentence = blankSentence.replace(match, '_____');
    }
  }

  return {
    type: 'fill-in-blank',
    sentence: blankSentence,
    options: generateOptions(word, usedWords),
    correctAnswer: word,
  };
};

// Function to handle fill in the blank question
export async function handleFillInBlankQuestion(questionData: {
  sentence: string;
  correctAnswer: string;
}): Promise<boolean> {
  display.info('\n🔍 Fill in the blank:');
  display.info(questionData.sentence);

  let answeredCorrectly = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!answeredCorrectly && attempts < maxAttempts) {
    attempts++;
    const answer = await askQuestion(chalk.yellow('👉 Enter the missing word: '));
    if (answer.toLowerCase() === questionData.correctAnswer.toLowerCase()) {
      display.success('Correct!');
      answeredCorrectly = true;
    } else {
      display.error('Wrong! Try again!');
    }
    if (attempts >= maxAttempts && !answeredCorrectly) {
      display.info('\n💡 Correct answer: ' + questionData.correctAnswer);
    }
  }
  return answeredCorrectly;
}

export async function handleQuestion(question: QuizQuestion, allWords: Word[]): Promise<boolean> {
  display.wordInfo({
    ...question.word,
    index: question.index,
    total: question.total,
    questionType: question.type,
    createdAt: question.word.createdAt,
  });

  let answeredCorrectly = false;
  switch (question.type) {
    case QUESTION_TYPES.MULTIPLE_CHOICE: {
      const { options, correctIndex } = createMultipleChoice(question.word, allWords);
      answeredCorrectly = await handleMultipleChoice(options, correctIndex);
      break;
    }
    case QUESTION_TYPES.KEYWORD_CHECK:
      answeredCorrectly = await handleKeywordCheck(question.word);
      break;
    case QUESTION_TYPES.SYNONYM: {
      const synonymQuestion = createSynonymQuestion(question.word, allWords);
      if (synonymQuestion) {
        const { options, correctIndex } = synonymQuestion;
        answeredCorrectly = await handleSynonymQuestion(options, correctIndex);
      }
      break;
    }
    case QUESTION_TYPES.MATCHING: {
      const matchingQuestion = createMatchingQuestion(question.word, allWords);
      answeredCorrectly = await handleMatchingQuestion(matchingQuestion);
      break;
    }
    case QUESTION_TYPES.FILL_IN_BLANK: {
      const fillInBlankQuestion = createFillInBlankQuestion(question.word, allWords);
      answeredCorrectly = await handleFillInBlankQuestion(fillInBlankQuestion);
      break;
    }
  }

  display.additionalInfo(question.word);
  return answeredCorrectly;
}
