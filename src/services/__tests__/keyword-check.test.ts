import { handleKeywordCheck } from '../question.service';
import { checkKeywords } from '../../utils/utils';
import { Word } from '../../interfaces';
import { askQuestion, display } from '../../utils/utils';

// Mock the askQuestion function and display utility
jest.mock('../../utils/utils', () => {
  const originalModule = jest.requireActual('../../utils/utils');
  return {
    ...originalModule,
    askQuestion: jest.fn(),
    display: {
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

describe('Keyword Check', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('checkKeywords', () => {
    it('should return true when at least 3 keywords match', () => {
      const answer = 'một ví dụ đại diện hoặc mẫu';
      const definition = 'một ví dụ đại diện hoặc mẫu';
      
      const result = checkKeywords(answer, definition);
      expect(result).toBe(true);
    });

    it('should return true when at least 70% of keywords match', () => {
      const answer = 'một ví dụ đại diện';
      const definition = 'một ví dụ đại diện hoặc mẫu';
      
      const result = checkKeywords(answer, definition);
      expect(result).toBe(true);
    });

    it('should return false when less than 3 keywords match and less than 70% match', () => {
      const answer = 'một ví dụ khác';
      const definition = 'một ví dụ đại diện hoặc mẫu';
      
      const result = checkKeywords(answer, definition);
      expect(result).toBe(false);
    });

    it('should handle diacritics correctly', () => {
      const answer = 'mot vi du dai dien';
      const definition = 'một ví dụ đại diện';
      
      const result = checkKeywords(answer, definition);
      expect(result).toBe(true);
    });

    it('should handle commas and parentheses in definition', () => {
      const answer = 'một ví dụ đại diện';
      const definition = 'một ví dụ (đại diện), hoặc mẫu';
      
      const result = checkKeywords(answer, definition);
      expect(result).toBe(true);
    });

    it('should handle extra words in answer', () => {
      const answer = 'đây là một ví dụ đại diện rất tốt';
      const definition = 'một ví dụ đại diện';
      
      const result = checkKeywords(answer, definition);
      expect(result).toBe(true);
    });

    it('should handle missing words in answer', () => {
      const answer = 'một ví dụ';
      const definition = 'một ví dụ đại diện hoặc mẫu';
      
      const result = checkKeywords(answer, definition);
      expect(result).toBe(false);
    });

    it('should handle empty answer', () => {
      const answer = '';
      const definition = 'một ví dụ đại diện';
      
      const result = checkKeywords(answer, definition);
      expect(result).toBe(false);
    });

    it('should handle empty definition', () => {
      const answer = 'một ví dụ đại diện';
      const definition = '';
      
      const result = checkKeywords(answer, definition);
      expect(result).toBe(false);
    });
  });

  describe('handleKeywordCheck', () => {
    it('should handle correct answer on first attempt', async () => {
      const wordData: Word = {
        word: 'example',
        category: 'noun',
        definitionEn: 'a representative form or pattern',
        definitionVn: 'một ví dụ đại diện hoặc mẫu',
        example: 'This is an example',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      (askQuestion as jest.Mock).mockResolvedValueOnce('một ví dụ đại diện');
      
      // Mock the checkKeywords function to return true
      jest.spyOn(require('../../utils/utils'), 'checkKeywords').mockReturnValueOnce(true);

      const result = await handleKeywordCheck(wordData);
      expect(result).toBe(true);
      expect(display.success).toHaveBeenCalledWith('Correct! You got the main idea!');
      expect(askQuestion).toHaveBeenCalledTimes(1);
    });

    it('should handle correct answer on second attempt', async () => {
      const wordData: Word = {
        word: 'example',
        category: 'noun',
        definitionEn: 'a representative form or pattern',
        definitionVn: 'một ví dụ đại diện hoặc mẫu',
        example: 'This is an example',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('sai')
        .mockResolvedValueOnce('một ví dụ đại diện');
      
      // Mock the checkKeywords function to return false then true
      jest.spyOn(require('../../utils/utils'), 'checkKeywords')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const result = await handleKeywordCheck(wordData);
      expect(result).toBe(true);
      expect(display.success).toHaveBeenCalledWith('Correct! You got the main idea!');
      expect(display.error).toHaveBeenCalledWith('Not correct! Try again!');
      expect(askQuestion).toHaveBeenCalledTimes(2);
    });

    it('should handle incorrect answer after maximum attempts', async () => {
      const wordData: Word = {
        word: 'example',
        category: 'noun',
        definitionEn: 'a representative form or pattern',
        definitionVn: 'một ví dụ đại diện hoặc mẫu',
        example: 'This is an example',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('sai 1')
        .mockResolvedValueOnce('sai 2')
        .mockResolvedValueOnce('sai 3');
      
      // Mock the checkKeywords function to return false three times
      jest.spyOn(require('../../utils/utils'), 'checkKeywords')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      const result = await handleKeywordCheck(wordData);
      expect(result).toBe(false);
      expect(display.error).toHaveBeenCalledWith('Not correct! Try again!');
      expect(display.info).toHaveBeenCalledWith('\n💡 Correct answer: một ví dụ đại diện hoặc mẫu');
      expect(askQuestion).toHaveBeenCalledTimes(3);
    });
  });
}); 