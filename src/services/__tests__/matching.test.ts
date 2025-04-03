import { createMatchingQuestion, handleMatchingQuestion } from '../question.service';
import { Word } from '../../interfaces';
import { askQuestion, display } from '../../utils/utils';

// Mock the askQuestion function and display utility
jest.mock('../../utils/utils', () => ({
  askQuestion: jest.fn(),
  display: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    options: jest.fn(),
  },
}));

describe('Matching Question', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createMatchingQuestion', () => {
    it('should create a matching question with the current word and 3 other words', () => {
      const wordData: Word = {
        word: 'happy',
        category: 'adjective',
        definitionEn: 'feeling or showing pleasure or contentment',
        definitionVn: 'vui vẻ',
        example: 'I am happy',
        synonyms: ['joyful', 'cheerful', 'merry'],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const allWords: Word[] = [
        wordData,
        {
          word: 'sad',
          category: 'adjective',
          definitionEn: 'feeling or showing sorrow',
          definitionVn: 'buồn',
          example: 'I am sad',
          synonyms: ['unhappy', 'sorrowful', 'gloomy'],
          note: '',
          createdAt: new Date().toISOString(),
        },
        {
          word: 'angry',
          category: 'adjective',
          definitionEn: 'feeling or showing anger',
          definitionVn: 'tức giận',
          example: 'I am angry',
          synonyms: ['mad', 'furious', 'enraged'],
          note: '',
          createdAt: new Date().toISOString(),
        },
        {
          word: 'tired',
          category: 'adjective',
          definitionEn: 'in need of sleep or rest',
          definitionVn: 'mệt mỏi',
          example: 'I am tired',
          synonyms: ['exhausted', 'weary', 'sleepy'],
          note: '',
          createdAt: new Date().toISOString(),
        },
      ];

      const result = createMatchingQuestion(wordData, allWords);
      
      // Check that we have 4 words and 4 definitions
      expect(result.words).toHaveLength(4);
      expect(result.definitions).toHaveLength(4);
      
      // Check that the current word is included
      expect(result.words).toContain(wordData.word);
      
      // Check that the current word's definition is included
      expect(result.definitions).toContain(wordData.definitionVn);
      
      // Check that the correctIndex points to the current word's definition
      expect(result.definitions[result.correctIndex]).toBe(wordData.definitionVn);
    });

    it('should handle case when there are not enough other words', () => {
      const wordData: Word = {
        word: 'happy',
        category: 'adjective',
        definitionEn: 'feeling or showing pleasure or contentment',
        definitionVn: 'vui vẻ',
        example: 'I am happy',
        synonyms: ['joyful', 'cheerful', 'merry'],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const allWords: Word[] = [
        wordData,
        {
          word: 'sad',
          category: 'adjective',
          definitionEn: 'feeling or showing sorrow',
          definitionVn: 'buồn',
          example: 'I am sad',
          synonyms: ['unhappy', 'sorrowful', 'gloomy'],
          note: '',
          createdAt: new Date().toISOString(),
        },
      ];

      const result = createMatchingQuestion(wordData, allWords);
      
      // Check that we have 2 words and 2 definitions
      expect(result.words).toHaveLength(2);
      expect(result.definitions).toHaveLength(2);
      
      // Check that the current word is included
      expect(result.words).toContain(wordData.word);
      
      // Check that the current word's definition is included
      expect(result.definitions).toContain(wordData.definitionVn);
      
      // Check that the correctIndex points to the current word's definition
      expect(result.definitions[result.correctIndex]).toBe(wordData.definitionVn);
    });

    it('should handle case when there is only one word', () => {
      const wordData: Word = {
        word: 'happy',
        category: 'adjective',
        definitionEn: 'feeling or showing pleasure or contentment',
        definitionVn: 'vui vẻ',
        example: 'I am happy',
        synonyms: ['joyful', 'cheerful', 'merry'],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const allWords: Word[] = [wordData];

      const result = createMatchingQuestion(wordData, allWords);
      
      // Check that we have 1 word and 1 definition
      expect(result.words).toHaveLength(1);
      expect(result.definitions).toHaveLength(1);
      
      // Check that the current word is included
      expect(result.words).toContain(wordData.word);
      
      // Check that the current word's definition is included
      expect(result.definitions).toContain(wordData.definitionVn);
      
      // Check that the correctIndex points to the current word's definition
      expect(result.correctIndex).toBe(0);
    });

    it('should shuffle the words and definitions', () => {
      const wordData: Word = {
        word: 'happy',
        category: 'adjective',
        definitionEn: 'feeling or showing pleasure or contentment',
        definitionVn: 'vui vẻ',
        example: 'I am happy',
        synonyms: ['joyful', 'cheerful', 'merry'],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const allWords: Word[] = [
        wordData,
        {
          word: 'sad',
          category: 'adjective',
          definitionEn: 'feeling or showing sorrow',
          definitionVn: 'buồn',
          example: 'I am sad',
          synonyms: ['unhappy', 'sorrowful', 'gloomy'],
          note: '',
          createdAt: new Date().toISOString(),
        },
        {
          word: 'angry',
          category: 'adjective',
          definitionEn: 'feeling or showing anger',
          definitionVn: 'tức giận',
          example: 'I am angry',
          synonyms: ['mad', 'furious', 'enraged'],
          note: '',
          createdAt: new Date().toISOString(),
        },
        {
          word: 'tired',
          category: 'adjective',
          definitionEn: 'in need of sleep or rest',
          definitionVn: 'mệt mỏi',
          example: 'I am tired',
          synonyms: ['exhausted', 'weary', 'sleepy'],
          note: '',
          createdAt: new Date().toISOString(),
        },
      ];

      // Mock Math.random to return a fixed value for consistent shuffling
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5);

      const result = createMatchingQuestion(wordData, allWords);
      
      // Restore Math.random
      Math.random = originalRandom;
      
      // Check that the words and definitions are shuffled
      // Since we mocked Math.random to return 0.5, the order should be predictable
      // but we don't know the exact order, so we just check that the arrays are not in their original order
      const originalWords = [wordData.word, 'sad', 'angry', 'tired'];
      const originalDefinitions = [wordData.definitionVn, 'buồn', 'tức giận', 'mệt mỏi'];
      
      // The arrays should not be equal to their original order
      expect(result.words).not.toEqual(originalWords);
      expect(result.definitions).not.toEqual(originalDefinitions);
      
      // But they should contain the same elements
      expect(result.words.sort()).toEqual(originalWords.sort());
      expect(result.definitions.sort()).toEqual(originalDefinitions.sort());
    });
  });

  describe('handleMatchingQuestion', () => {
    it('should handle correct answer on first attempt', async () => {
      const questionData = {
        words: ['happy', 'sad', 'angry', 'tired'],
        definitions: ['vui vẻ', 'buồn', 'tức giận', 'mệt mỏi'],
        correctIndex: 0,
      };

      (askQuestion as jest.Mock).mockResolvedValueOnce('1');

      const result = await handleMatchingQuestion(questionData);
      expect(result).toBe(true);
      expect(display.success).toHaveBeenCalledWith('Correct!');
      expect(display.options).toHaveBeenCalledWith(questionData.definitions);
    });

    it('should handle incorrect answer', async () => {
      const questionData = {
        words: ['happy', 'sad', 'angry', 'tired'],
        definitions: ['vui vẻ', 'buồn', 'tức giận', 'mệt mỏi'],
        correctIndex: 0,
      };

      (askQuestion as jest.Mock).mockResolvedValueOnce('2');

      const result = await handleMatchingQuestion(questionData);
      expect(result).toBe(false);
      expect(display.error).toHaveBeenCalledWith('Wrong! Try again!');
      expect(display.options).toHaveBeenCalledWith(questionData.definitions);
    });

    it('should handle invalid input', async () => {
      const questionData = {
        words: ['happy', 'sad', 'angry', 'tired'],
        definitions: ['vui vẻ', 'buồn', 'tức giận', 'mệt mỏi'],
        correctIndex: 0,
      };

      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('invalid')
        .mockResolvedValueOnce('5')
        .mockResolvedValueOnce('1');

      const result = await handleMatchingQuestion(questionData);
      expect(result).toBe(true);
      expect(display.error).toHaveBeenCalledWith('Please choose a number from 1 to 4');
      expect(display.options).toHaveBeenCalledWith(questionData.definitions);
    });

    it('should show correct answer after maximum attempts', async () => {
      const questionData = {
        words: ['happy', 'sad', 'angry', 'tired'],
        definitions: ['vui vẻ', 'buồn', 'tức giận', 'mệt mỏi'],
        correctIndex: 0,
      };

      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('2')
        .mockResolvedValueOnce('3')
        .mockResolvedValueOnce('4');

      const result = await handleMatchingQuestion(questionData);
      expect(result).toBe(false);
      expect(display.info).toHaveBeenCalledWith('\n💡 Correct answer: ' + questionData.definitions[questionData.correctIndex]);
      expect(display.options).toHaveBeenCalledWith(questionData.definitions);
    });
  });
}); 