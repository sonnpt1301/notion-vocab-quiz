import { createMultipleChoice, handleMultipleChoice } from '../question.service';
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

describe('Multiple Choice Question', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createMultipleChoice', () => {
    it('should create options with correct answer and 3 wrong answers', () => {
      const wordData: Word = {
        word: 'example',
        category: 'noun',
        definitionEn: 'a representative form or pattern',
        definitionVn: 'ví dụ',
        example: 'This is an example',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const allWords: Word[] = [
        wordData,
        {
          word: 'sample',
          category: 'noun',
          definitionEn: 'a small part of something',
          definitionVn: 'mẫu',
          example: 'This is a sample',
          synonyms: [],
          note: '',
          createdAt: new Date().toISOString(),
        },
        {
          word: 'instance',
          category: 'noun',
          definitionEn: 'an occurrence of something',
          definitionVn: 'trường hợp',
          example: 'This is an instance',
          synonyms: [],
          note: '',
          createdAt: new Date().toISOString(),
        },
        {
          word: 'case',
          category: 'noun',
          definitionEn: 'a particular situation',
          definitionVn: 'trường hợp khác',
          example: 'This is a case',
          synonyms: [],
          note: '',
          createdAt: new Date().toISOString(),
        },
      ];

      const result = createMultipleChoice(wordData, allWords);
      expect(result.options).toHaveLength(4);
      expect(result.options).toContain(wordData.definitionVn);
      expect(result.correctIndex).toBeGreaterThanOrEqual(0);
      expect(result.correctIndex).toBeLessThan(4);
      expect(result.options[result.correctIndex]).toBe(wordData.definitionVn);
    });

    it('should handle case when there are not enough words for options', () => {
      const wordData: Word = {
        word: 'test',
        definitionVn: 'kiểm tra',
        definitionEn: 'to check something',
        example: 'This is a test',
        category: 'verb',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };
      const allWords: Word[] = [
        wordData,
        {
          word: 'another',
          definitionVn: 'khác',
          definitionEn: 'different or additional',
          example: 'Another example',
          category: 'adjective',
          synonyms: [],
          note: '',
          createdAt: new Date().toISOString(),
        },
      ];

      const result = createMultipleChoice(wordData, allWords);

      expect(result.options).toHaveLength(4);
      expect(result.correctIndex).toBeGreaterThanOrEqual(0);
      expect(result.correctIndex).toBeLessThan(4);
      expect(result.options[result.correctIndex]).toBe(wordData.definitionVn);
      // Check that some options include counter numbers to make up 4 options
      expect(result.options.some(option => /\(\d+\)$/.test(option))).toBe(true);
    });

    it('should handle case when there are duplicate definitions', () => {
      const wordData: Word = {
        word: 'example',
        category: 'noun',
        definitionEn: 'a representative form or pattern',
        definitionVn: 'ví dụ',
        example: 'This is an example',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const allWords: Word[] = [
        wordData,
        {
          word: 'sample',
          category: 'noun',
          definitionEn: 'a small part of something',
          definitionVn: 'ví dụ', // Same definition as wordData
          example: 'This is a sample',
          synonyms: [],
          note: '',
          createdAt: new Date().toISOString(),
        },
        {
          word: 'instance',
          category: 'noun',
          definitionEn: 'an occurrence of something',
          definitionVn: 'trường hợp',
          example: 'This is an instance',
          synonyms: [],
          note: '',
          createdAt: new Date().toISOString(),
        },
        {
          word: 'case',
          category: 'noun',
          definitionEn: 'a particular situation',
          definitionVn: 'trường hợp', // Same definition as instance
          example: 'This is a case',
          synonyms: [],
          note: '',
          createdAt: new Date().toISOString(),
        },
      ];

      const result = createMultipleChoice(wordData, allWords);
      expect(result.options).toHaveLength(4);
      expect(result.options).toContain(wordData.definitionVn);
      expect(result.correctIndex).toBeGreaterThanOrEqual(0);
      expect(result.correctIndex).toBeLessThan(4);
      expect(result.options[result.correctIndex]).toBe(wordData.definitionVn);
      // Check that there are no duplicate options
      expect(new Set(result.options).size).toBe(result.options.length);
    });
  });

  describe('handleMultipleChoice', () => {
    it('should handle correct answer', async () => {
      const options = ['ví dụ', 'mẫu', 'trường hợp', 'trường hợp khác'];
      const correctIndex = 0;

      (askQuestion as jest.Mock).mockResolvedValueOnce('1');

      const result = await handleMultipleChoice(options, correctIndex);
      expect(result).toBe(true);
      expect(display.success).toHaveBeenCalledWith('Correct!');
      expect(display.options).toHaveBeenCalledWith(options);
    });

    it('should handle incorrect answer', async () => {
      const options = ['ví dụ', 'mẫu', 'trường hợp', 'trường hợp khác'];
      const correctIndex = 0;

      (askQuestion as jest.Mock).mockResolvedValueOnce('2');

      const result = await handleMultipleChoice(options, correctIndex);
      expect(result).toBe(false);
      expect(display.error).toHaveBeenCalledWith('Wrong! Try again!');
      expect(display.options).toHaveBeenCalledWith(options);
    });

    it('should handle invalid input', async () => {
      const options = ['ví dụ', 'mẫu', 'trường hợp', 'trường hợp khác'];
      const correctIndex = 0;

      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('invalid')
        .mockResolvedValueOnce('5')
        .mockResolvedValueOnce('1');

      const result = await handleMultipleChoice(options, correctIndex);
      expect(result).toBe(true);
      expect(display.error).toHaveBeenCalledWith('Please enter a number');
      expect(display.error).toHaveBeenCalledWith(`Please choose an answer from 1 to ${options.length}`);
      expect(display.options).toHaveBeenCalledWith(options);
    });

    it('should handle maximum attempts', async () => {
      const options = ['ví dụ', 'mẫu', 'trường hợp', 'trường hợp khác'];
      const correctIndex = 0;

      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('2')
        .mockResolvedValueOnce('3')
        .mockResolvedValueOnce('4');

      const result = await handleMultipleChoice(options, correctIndex);
      expect(result).toBe(false);
      expect(display.info).toHaveBeenCalledWith('\n💡 Correct answer: ' + options[correctIndex]);
      expect(display.options).toHaveBeenCalledWith(options);
    });
  });
}); 