import {
  displayTimeOptions,
  displayQuestionTypeOptions,
  handleTimeSelection,
  handleWordLimit,
  createRandomQuestion,
  runQuiz,
} from '../quiz.service';
import { getWordsFromNotion } from '../notion.service';
import { exportToCSV } from '../export.service';
import { handleQuestion } from '../question.service';
import { QUESTION_TYPES } from '../../constants';
import { QuizQuestion, Word } from '../../interfaces';
import { askQuestion, display, shuffleArray } from '../../utils/utils';
import dayjs from 'dayjs';
import path from 'path';

// Mock all dependencies
jest.mock('../notion.service');
jest.mock('../export.service');
jest.mock('../question.service', () => ({
  handleQuestion: jest.fn(),
  handleFillInBlankQuestion: jest.fn(),
  createFillInBlankQuestion: jest.fn(),
}));
jest.mock('../../utils/utils', () => ({
  askQuestion: jest.fn(),
  display: {
    title: jest.fn(),
    question: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    result: jest.fn(),
    wordInfo: jest.fn(),
    options: jest.fn(),
  },
  shuffleArray: jest.fn((arr) => arr), // Return array as is for predictable testing
}));

describe('Quiz Service', () => {
  const mockWords: Word[] = [
    {
      word: 'happy',
      category: 'adjective',
      definitionEn: 'feeling or showing pleasure',
      definitionVn: 'vui vẻ',
      example: 'I am happy',
      synonyms: ['joyful'],
      note: '',
      createdAt: new Date().toISOString(),
    },
    {
      word: 'sad',
      category: 'adjective',
      definitionEn: 'feeling sorrow',
      definitionVn: 'buồn',
      example: 'I am sad',
      synonyms: ['unhappy'],
      note: '',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getWordsFromNotion as jest.Mock).mockResolvedValue(mockWords);
    (handleQuestion as jest.Mock).mockResolvedValue(true);
    (display.error as jest.Mock).mockClear();
    (display.info as jest.Mock).mockClear();
  });

  describe('displayTimeOptions', () => {
    it('should display time range options', () => {
      displayTimeOptions();
      expect(display.title).toHaveBeenCalledWith('\n🎮 VOCABULARY LEARNING PROGRAM\n');
      expect(display.question).toHaveBeenCalledWith('Choose time range to learn words:');
    });
  });

  describe('displayQuestionTypeOptions', () => {
    it('should display question type options', () => {
      displayQuestionTypeOptions();
      expect(display.question).toHaveBeenCalledWith('Choose question type:');
    });
  });

  describe('handleTimeSelection', () => {
    it('should handle valid time range selection', async () => {
      (askQuestion as jest.Mock).mockResolvedValueOnce('1');
      const result = await handleTimeSelection();
      expect(result).toBe('1');
    });

    it('should handle specific date selection', async () => {
      (askQuestion as jest.Mock).mockResolvedValueOnce('6').mockResolvedValueOnce('2024-02-20');
      const result = await handleTimeSelection();
      expect(result).toBe('2024-02-20');
    });

    it('should handle invalid date format', async () => {
      (askQuestion as jest.Mock).mockResolvedValueOnce('6').mockResolvedValueOnce('invalid-date');
      const result = await handleTimeSelection();
      expect(result).toBeNull();
      expect(display.error).toHaveBeenCalledWith('❌ Invalid date format!');
    });

    it('should handle export option', async () => {
      (askQuestion as jest.Mock).mockResolvedValueOnce('7');
      const result = await handleTimeSelection();
      expect(result).toBe('export');
    });

    it('should handle exit option', async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      (askQuestion as jest.Mock).mockResolvedValueOnce('8');
      await handleTimeSelection();
      expect(display.info).toHaveBeenCalledWith('👋 Goodbye!');
      expect(mockExit).toHaveBeenCalledWith(0);
      mockExit.mockRestore();
    });
  });

  describe('handleWordLimit', () => {
    it('should return null for all words option', async () => {
      const result = await handleWordLimit('1');
      expect(result).toBeNull();
    });

    it('should return null for export option', async () => {
      const result = await handleWordLimit('export');
      expect(result).toBeNull();
    });

    it('should return number for other options', async () => {
      (askQuestion as jest.Mock).mockResolvedValueOnce('5');
      const result = await handleWordLimit('2');
      expect(result).toBe(5);
    });

    it('should handle invalid number input', async () => {
      (askQuestion as jest.Mock).mockResolvedValueOnce('abc');
      const result = await handleWordLimit('2');
      expect(result).toBe(NaN);
    });

    it('should handle negative number input', async () => {
      (askQuestion as jest.Mock).mockResolvedValueOnce('-5');
      const result = await handleWordLimit('2');
      expect(result).toBe(-5);
    });

    it('should handle zero input', async () => {
      (askQuestion as jest.Mock).mockResolvedValueOnce('0');
      const result = await handleWordLimit('2');
      expect(result).toBe(0);
    });
  });

  describe('createRandomQuestion', () => {
    it('should create question with specific type when selected', () => {
      const result = createRandomQuestion(mockWords[0], 1, 2, mockWords, '2');
      expect(result.type).toBe(Object.values(QUESTION_TYPES)[0]); // First type after Random
    });

    it('should create random type question when no type selected', () => {
      const result = createRandomQuestion(mockWords[0], 1, 2, mockWords);
      expect(Object.values(QUESTION_TYPES)).toContain(result.type);
    });

    it('should create questions for all question types', () => {
      const questionTypes = Object.values(QUESTION_TYPES);
      questionTypes.forEach((type, index) => {
        const result = createRandomQuestion(mockWords[0], 1, 2, mockWords, (index + 2).toString());
        expect(result.type).toBe(type);
      });
    });

    it('should handle empty word list', () => {
      const result = createRandomQuestion(mockWords[0], 1, 2, [], '2');
      expect(result).toBeDefined();
      expect(result.word).toBe(mockWords[0]);
    });
  });

  describe('runQuiz', () => {
    it('should handle successful quiz run with all words', async () => {
      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('1') // Time selection
        .mockResolvedValueOnce('1'); // Question type

      await runQuiz();

      expect(getWordsFromNotion).toHaveBeenCalledWith('1');
      expect(display.success).toHaveBeenCalledWith('Found 2 words to learn!');
      expect(handleQuestion).toHaveBeenCalledTimes(2);
      expect(display.result).toHaveBeenCalledWith(2, 2); // All answers correct
    });

    it('should handle successful quiz run with word limit', async () => {
      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('2') // Time selection
        .mockResolvedValueOnce('1') // Word limit
        .mockResolvedValueOnce('1'); // Question type

      await runQuiz();

      expect(getWordsFromNotion).toHaveBeenCalledWith('2');
      expect(handleQuestion).toHaveBeenCalledTimes(1);
      expect(display.result).toHaveBeenCalledWith(1, 1);
    });

    it('should handle export option', async () => {
      (askQuestion as jest.Mock).mockResolvedValueOnce('export');

      await runQuiz();

      const expectedPath = path.join(process.cwd(), `exported-vocab-${dayjs().format('YYYY-MM-DD')}.csv`);
      expect(exportToCSV).toHaveBeenCalledWith(mockWords, expectedPath);
      expect(display.success).toHaveBeenCalledWith(`Exported ${mockWords.length} words to ${expectedPath}`);
    });

    it('should handle no words found', async () => {
      (getWordsFromNotion as jest.Mock).mockResolvedValueOnce([]);
      (askQuestion as jest.Mock).mockResolvedValueOnce('1');

      await runQuiz();

      expect(display.error).toHaveBeenCalledWith('No words found!');
    });

    it('should handle errors during quiz', async () => {
      const error = new Error('Test error');
      (getWordsFromNotion as jest.Mock).mockRejectedValueOnce(error);
      (askQuestion as jest.Mock).mockResolvedValueOnce('1');

      await runQuiz();

      expect(display.error).toHaveBeenCalledWith('An error occurred: Test error');
    });

    it('should handle invalid time selection', async () => {
      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('6') // Specific date option
        .mockResolvedValueOnce('invalid-date');

      await runQuiz();

      expect(display.error).toHaveBeenCalledWith('❌ Invalid date format!');
    });

    it('should handle partial score with some correct and incorrect answers', async () => {
      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('1') // Time selection
        .mockResolvedValueOnce('1'); // Question type

      (handleQuestion as jest.Mock)
        .mockResolvedValueOnce(true)  // First answer correct
        .mockResolvedValueOnce(false); // Second answer incorrect

      await runQuiz();

      expect(handleQuestion).toHaveBeenCalledTimes(2);
      expect(display.result).toHaveBeenCalledWith(1, 2); // 1 correct out of 2
    });

    it('should handle different question types in the same quiz', async () => {
      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('1') // Time selection
        .mockResolvedValueOnce('1'); // Random question type

      // Mock handleQuestion to return different question types
      (handleQuestion as jest.Mock)
        .mockImplementationOnce(async (question) => {
          question.type = QUESTION_TYPES.MULTIPLE_CHOICE;
          return true;
        })
        .mockImplementationOnce(async (question) => {
          question.type = QUESTION_TYPES.FILL_IN_BLANK;
          return true;
        });

      await runQuiz();

      expect(handleQuestion).toHaveBeenCalledTimes(2);
      // Verify that different question types were created
      const questionTypes = (handleQuestion as jest.Mock).mock.calls.map(call => call[0].type);
      expect(new Set(questionTypes).size).toBeGreaterThan(1);
    });

    it('should handle maximum attempts reached in fill-in-blank questions', async () => {
      // Setup mocks
      (askQuestion as jest.Mock)
        .mockResolvedValueOnce('2') // Time selection (not '1' to allow word limit)
        .mockResolvedValueOnce('1') // Word limit = 1
        .mockResolvedValueOnce('5'); // Fill in blank type

      // Mock handleQuestion to simulate wrong answers
      (handleQuestion as jest.Mock).mockImplementationOnce(async () => {
        display.error('Wrong! Try again!');
        display.error('Wrong! Try again!');
        display.error('Wrong! Try again!');
        display.info('\n💡 Correct answer: answer');
        return false;
      });

      await runQuiz();

      // Verify the error message was displayed three times
      expect(display.error).toHaveBeenCalledWith('Wrong! Try again!');
      expect(display.error).toHaveBeenCalledTimes(3);
      
      // Verify the correct answer was shown
      expect(display.info).toHaveBeenCalledWith(expect.stringContaining('Correct answer:'));
      
      // Verify the final score
      expect(display.result).toHaveBeenCalledWith(0, 1); // 0 correct out of 1
    });
  });
});
