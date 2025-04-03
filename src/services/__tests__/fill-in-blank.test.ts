import { createFillInBlankQuestion, handleFillInBlankQuestion } from '../question.service';
import { Word } from '../../interfaces';
import { askQuestion, display } from '../../utils/utils';

// Mock the askQuestion function and display utility
jest.mock('../../utils/utils', () => ({
  askQuestion: jest.fn(),
  display: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Fill in the Blank Question', () => {
  const testCases = [
    // Single words with regular conjugations
    {
      word: 'example',
      example: 'This is an example of a good test.',
      expected: 'This is an _____ of a good test.',
    },
    {
      word: 'snore',
      example: 'He snores so loudly that I can\'t help',
      expected: 'He _____ so loudly that I can\'t help',
    },
    // Compound words
    {
      word: 'breakthrough',
      example: 'The scientist made a major breakthrough in cancer research',
      expected: 'The scientist made a major _____ in cancer research',
    },
    // Phrasal verbs with pronouns
    {
      word: 'give a lift back',
      example: 'Can you give me a lift back home after the party?',
      expected: 'Can you _____ home after the party?',
    },
    {
      word: 'give a lift back',
      example: 'I gave him a lift back to his house',
      expected: 'I _____ to his house',
    },
    // Verbs with irregular conjugations
    {
      word: 'brownnose',
      example: 'He\'s always brownnosing the boss to get a promotion',
      expected: 'He\'s always _____ the boss to get a promotion',
    },
    {
      word: 'overstep',
      example: 'He overstepped his authority by making that decision without approval',
      expected: 'He _____ his authority by making that decision without approval',
    },
    // Multi-word phrases
    {
      word: 'take the high road',
      example: 'Even though he insulted her, she took the high road and didn\'t response',
      expected: 'Even though he insulted her, she _____ and didn\'t response',
    },
    // Phrasal verbs
    {
      word: 'run across',
      example: 'I ran across my old friend at the mall yesterday',
      expected: 'I _____ my old friend at the mall yesterday',
    },
    // Words with special characters
    {
      word: 'can\'t',
      example: 'I can\'t believe it',
      expected: 'I _____ believe it',
    },
    // Words with contractions
    {
      word: 'don\'t',
      example: 'I don\'t like it',
      expected: 'I _____ like it',
    },
    // Words with apostrophes
    {
      word: 'it\'s',
      example: 'It\'s a beautiful day',
      expected: '_____ a beautiful day',
    },
    // Words with hyphens
    {
      word: 'self-esteem',
      example: 'Her self-esteem improved after the therapy',
      expected: 'Her _____ improved after the therapy',
    },
    // Words with numbers
    {
      word: '24/7',
      example: 'The store is open 24/7',
      expected: 'The store is open _____',
    },
  ];

  describe('createFillInBlankQuestion', () => {
    testCases.forEach(({ word, example, expected }) => {
      it(`should correctly handle "${word}"`, () => {
        const mockWord: Word = {
          word,
          definitionVn: 'test',
          definitionEn: 'test',
          example,
          synonyms: [],
          category: 'verb',
          createdAt: '2024-01-01',
          note: '',
        };

        const question = createFillInBlankQuestion(mockWord, []);
        expect(question.sentence).toBe(expected);
        expect(question.correctAnswer).toBe(word);
      });
    });

    it('should handle words with special characters', () => {
      const mockWord: Word = {
        word: 'can\'t',
        definitionVn: 'test',
        definitionEn: 'test',
        example: 'I can\'t believe it',
        synonyms: [],
        category: 'verb',
        createdAt: '2024-01-01',
        note: '',
      };

      const question = createFillInBlankQuestion(mockWord, []);
      expect(question.sentence).toBe('I _____ believe it');
    });

    // Words ending in 'e'
    it('should correctly handle "make" (e -> ing)', () => {
      const wordData: Word = {
        word: 'make',
        category: 'verb',
        definitionEn: 'He is making a cake',
        definitionVn: 'làm',
        example: 'He is making a cake',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('He is _____ a cake');
      expect(result.correctAnswer).toBe('make');
    });

    it('should correctly handle "hope" (e -> ed)', () => {
      const wordData: Word = {
        word: 'hope',
        category: 'verb',
        definitionEn: 'She hoped for the best',
        definitionVn: 'hy vọng',
        example: 'She hoped for the best',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('She _____ for the best');
      expect(result.correctAnswer).toBe('hope');
    });

    // Words ending in 'y' after consonant
    it('should correctly handle "try" (y -> ies)', () => {
      const wordData: Word = {
        word: 'try',
        category: 'verb',
        definitionEn: 'He tries his best',
        definitionVn: 'cố gắng',
        example: 'He tries his best',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('He _____ his best');
      expect(result.correctAnswer).toBe('try');
    });

    it('should correctly handle "cry" (y -> ied)', () => {
      const wordData: Word = {
        word: 'cry',
        category: 'verb',
        definitionEn: 'She cried all night',
        definitionVn: 'khóc',
        example: 'She cried all night',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('She _____ all night');
      expect(result.correctAnswer).toBe('cry');
    });

    // Words ending in 'ie'
    it('should correctly handle "die" (ie -> ying)', () => {
      const wordData: Word = {
        word: 'die',
        category: 'verb',
        definitionEn: 'The plant is dying',
        definitionVn: 'chết',
        example: 'The plant is dying',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('The plant is _____');
      expect(result.correctAnswer).toBe('die');
    });

    // Words ending in 'c'
    it('should correctly handle "panic" (c -> cking)', () => {
      const wordData: Word = {
        word: 'panic',
        category: 'verb',
        definitionEn: 'He is panicking',
        definitionVn: 'hoảng sợ',
        example: 'He is panicking',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('He is _____');
      expect(result.correctAnswer).toBe('panic');
    });

    it('should correctly handle "picnic" (c -> cked)', () => {
      const wordData: Word = {
        word: 'picnic',
        category: 'verb',
        definitionEn: 'They picnicked in the park',
        definitionVn: 'dã ngoại',
        example: 'They picnicked in the park',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('They _____ in the park');
      expect(result.correctAnswer).toBe('picnic');
    });

    // Words with single vowel + consonant
    it('should correctly handle "run" (double consonant + ing)', () => {
      const wordData: Word = {
        word: 'run',
        category: 'verb',
        definitionEn: 'He is running fast',
        definitionVn: 'chạy',
        example: 'He is running fast',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('He is _____ fast');
      expect(result.correctAnswer).toBe('run');
    });

    it('should correctly handle "stop" (double consonant + ed)', () => {
      const wordData: Word = {
        word: 'stop',
        category: 'verb',
        definitionEn: 'The car stopped suddenly',
        definitionVn: 'dừng lại',
        example: 'The car stopped suddenly',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('The car _____ suddenly');
      expect(result.correctAnswer).toBe('stop');
    });

    // Words with multiple patterns
    it('should correctly handle "study" (y -> ied, y -> ies)', () => {
      const wordData: Word = {
        word: 'study',
        category: 'verb',
        definitionEn: 'She studied hard and studies every day',
        definitionVn: 'học',
        example: 'She studied hard and studies every day',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('She _____ hard and _____ every day');
      expect(result.correctAnswer).toBe('study');
    });

    // Words with irregular forms
    it('should correctly handle "go" (irregular forms)', () => {
      const wordData: Word = {
        word: 'go',
        category: 'verb',
        definitionEn: 'He went to the store and is going home',
        definitionVn: 'đi',
        example: 'He went to the store and is going home',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('He _____ to the store and is _____ home');
      expect(result.correctAnswer).toBe('go');
    });

    // Specific cases that need to be fixed
    it('should correctly handle "take the high road" with Vietnamese definition', () => {
      const wordData: Word = {
        word: 'take the high road',
        category: 'phrase',
        definitionEn: 'Even though he insulted her, she took the high road and didn\'t response',
        definitionVn: 'xúc phạm',
        example: 'Even though he insulted her, she took the high road and didn\'t response',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('Even though he insulted her, she _____ and didn\'t response');
      expect(result.correctAnswer).toBe('take the high road');
    });

    it('should correctly handle "give a lift back" with pronoun', () => {
      const wordData: Word = {
        word: 'give a lift back',
        category: 'phrase',
        definitionEn: 'Can you give me a lift back home after the party?',
        definitionVn: 'đưa về nhà',
        example: 'Can you give me a lift back home after the party?',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('Can you _____ home after the party?');
      expect(result.correctAnswer).toBe('give a lift back');
    });

    it('should correctly handle "snore" with contraction', () => {
      const wordData: Word = {
        word: 'snore',
        category: 'verb',
        definitionEn: 'He snores so loudly that I can\'t help',
        definitionVn: 'ngáy',
        example: 'He snores so loudly that I can\'t help',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('He _____ so loudly that I can\'t help');
      expect(result.correctAnswer).toBe('snore');
    });

    it('should correctly handle "overstep" with Vietnamese definition', () => {
      const wordData: Word = {
        word: 'overstep',
        category: 'verb',
        definitionEn: 'He overstepped his authority by making that decision without approval',
        definitionVn: 'quyền hạn',
        example: 'He overstepped his authority by making that decision without approval',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('He _____ his authority by making that decision without approval');
      expect(result.correctAnswer).toBe('overstep');
    });

    it('should correctly handle "brownnose" with continuous form', () => {
      const wordData: Word = {
        word: 'brownnose',
        category: 'verb',
        definitionEn: 'He\'s always brownnosing the boss to get a promotion',
        definitionVn: 'nịnh hót',
        example: 'He\'s always brownnosing the boss to get a promotion',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('He\'s always _____ the boss to get a promotion');
      expect(result.correctAnswer).toBe('brownnose');
    });

    it('should correctly handle "run across" with past tense', () => {
      const wordData: Word = {
        word: 'run across',
        category: 'phrase',
        definitionEn: 'I ran across my old friend at the mall yesterday',
        definitionVn: 'tình cờ gặp',
        example: 'I ran across my old friend at the mall yesterday',
        synonyms: [],
        note: '',
        createdAt: new Date().toISOString(),
      };

      const result = createFillInBlankQuestion(wordData, []);
      expect(result.sentence).toBe('I _____ my old friend at the mall yesterday');
      expect(result.correctAnswer).toBe('run across');
    });
  });

  describe('handleFillInBlankQuestion', () => {
    testCases.forEach(({ word }) => {
      it(`should handle "${word}" case insensitively`, async () => {
        const mockWord: Word = {
          word,
          definitionVn: 'test',
          definitionEn: 'test',
          example: 'test',
          synonyms: [],
          category: 'verb',
          createdAt: '2024-01-01',
          note: '',
        };

        const question = createFillInBlankQuestion(mockWord, []);
        (askQuestion as jest.Mock).mockResolvedValue(word.toUpperCase());
        
        const result = await handleFillInBlankQuestion(question);
        expect(result).toBe(true);
        expect(display.success).toHaveBeenCalledWith('Correct!');
      });
    });
  });
}); 