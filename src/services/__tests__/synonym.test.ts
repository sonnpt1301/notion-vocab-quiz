import { createSynonymQuestion, handleSynonymQuestion } from '../question.service';
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

describe('Synonym Question', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createSynonymQuestion', () => {
    it('should return empty options and -1 index when word has no synonyms', () => {
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

      const result = createSynonymQuestion(wordData, []);
      expect(result.options).toHaveLength(0);
      expect(result.correctIndex).toBe(-1);
    });

    it('should create options with one correct synonym and three wrong ones', () => {
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
      ];

      const result = createSynonymQuestion(wordData, allWords);
      expect(result.options).toHaveLength(4);
      expect(wordData.synonyms).toContain(result.options[result.correctIndex]);
      expect(result.options.filter(opt => !wordData.synonyms.includes(opt))).toHaveLength(3);
    });

    it('should handle case when there are not enough wrong synonyms', () => {
      const wordData: Word = {
        word: 'happy',
        category: 'adjective',
        definitionEn: 'feeling or showing pleasure or contentment',
        definitionVn: 'vui vẻ',
        example: 'I am happy',
        synonyms: ['joyful'],
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
          synonyms: ['unhappy'],
          note: '',
          createdAt: new Date().toISOString(),
        },
      ];

      const result = createSynonymQuestion(wordData, allWords);
      expect(result.options).toHaveLength(2);
      expect(result.options).toContain('joyful');
      expect(result.options).toContain('unhappy');
      expect(result.correctIndex).toBe(result.options.indexOf('joyful'));
    });

    it('should not include duplicate synonyms in options', () => {
      const wordData: Word = {
        word: 'happy',
        category: 'adjective',
        definitionEn: 'feeling or showing pleasure or contentment',
        definitionVn: 'vui vẻ',
        example: 'I am happy',
        synonyms: ['joyful', 'cheerful'],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const allWords: Word[] = [
        wordData,
        {
          word: 'glad',
          category: 'adjective',
          definitionEn: 'feeling or showing pleasure',
          definitionVn: 'vui vẻ',
          example: 'I am glad',
          synonyms: ['joyful', 'pleased'], // 'joyful' is also in wordData.synonyms
          note: '',
          createdAt: new Date().toISOString(),
        },
      ];

      const result = createSynonymQuestion(wordData, allWords);
      expect(result.options).toHaveLength(3);
      expect(new Set(result.options).size).toBe(result.options.length); // No duplicates
      expect(wordData.synonyms).toContain(result.options[result.correctIndex]);
    });
  });

  describe('handleSynonymQuestion', () => {
    it('should handle correct answer on first attempt', async () => {
      const options = ['joyful', 'unhappy', 'angry', 'sad'];
      const correctIndex = 0;

      (askQuestion as jest.Mock).mockResolvedValueOnce('1');

      const result = await handleSynonymQuestion(options, correctIndex);
      expect(result).toBe(true);
      expect(display.success).toHaveBeenCalledWith('Correct!');
      expect(display.options).toHaveBeenCalledWith(options);
    });

    it('should handle incorrect answer', async () => {
      const options = ['joyful', 'unhappy', 'angry', 'sad'];
      const correctIndex = 0;

      (askQuestion as jest.Mock).mockResolvedValueOnce('2');

      const result = await handleSynonymQuestion(options, correctIndex);
      expect(result).toBe(false);
      expect(display.error).toHaveBeenCalledWith('Wrong! Try again!');
      expect(display.options).toHaveBeenCalledWith(options);
    });

    it('should handle invalid input', async () => {
      const options = ['joyful', 'unhappy', 'angry', 'sad'];
      const correctIndex = 0;

      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('invalid')
        .mockResolvedValueOnce('5')
        .mockResolvedValueOnce('1');

      const result = await handleSynonymQuestion(options, correctIndex);
      expect(result).toBe(true);
      expect(display.error).toHaveBeenCalledWith('Please choose an answer from 1 to 4');
      expect(display.options).toHaveBeenCalledWith(options);
    });

    it('should show correct answer after maximum attempts', async () => {
      const options = ['joyful', 'unhappy', 'angry', 'sad'];
      const correctIndex = 0;

      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('2')
        .mockResolvedValueOnce('3')
        .mockResolvedValueOnce('4');

      const result = await handleSynonymQuestion(options, correctIndex);
      expect(result).toBe(false);
      expect(display.info).toHaveBeenCalledWith('\n💡 Correct answer: joyful');
      expect(display.options).toHaveBeenCalledWith(options);
    });
  });
}); 