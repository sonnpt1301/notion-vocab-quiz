import { Client } from '@notionhq/client';
import { PageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import process from 'process';
import { NotionProperties, Word } from '../interfaces';
import { display } from '../utils';
import { getConfig } from './config.service';

// Suppress Notion client warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out Notion client warnings
  if (args[0] && typeof args[0] === 'string' && args[0].includes('@notionhq/client warn')) {
    return;
  }
  originalConsoleWarn(...args);
};

dayjs.extend(utc);
dayjs.extend(timezone);
const userTimezone = dayjs.tz.guess();
dayjs.tz.setDefault(userTimezone);

let notionClient: Client | null = null;

function getNotionClient(): Client {
  try {
    if (!notionClient) {
      const config = getConfig();
      if (!config) {
        display.error('Please run "nvq setup" or "nvq setup" to configure your Notion credentials');
        process.exit(1);
      }
      notionClient = new Client({
        auth: config.NOTION_TOKEN,
      });
    }
    return notionClient;
  } catch (error) {
    display.error('Error when getting Notion client');
    process.exit(1);
  }
}

function getDateRange(timeRange: string | number): string | null {
  let selectedDate: string | null = null;

  if (timeRange !== 0) {
    const today = dayjs().tz(userTimezone).startOf('day');

    const numericTimeRange = Number(timeRange);
    if (!isNaN(numericTimeRange)) {
      switch (numericTimeRange) {
        case 1: // All
          break;
        case 2: // Today
          selectedDate = today.format('YYYY-MM-DD');
          break;
        case 3: // Yesterday
          selectedDate = today.subtract(1, 'day').format('YYYY-MM-DD');
          break;
        case 4: // Last 7 days
          selectedDate = today.subtract(7, 'day').format('YYYY-MM-DD');
          break;
        case 5: // Last 30 days
          selectedDate = today.subtract(30, 'day').format('YYYY-MM-DD');
          break;
      }
    } else if (dayjs(timeRange, 'YYYY-MM-DD', true).isValid()) {
      selectedDate = dayjs(timeRange).startOf('day').format('YYYY-MM-DD');
    }
  }

  return selectedDate;
}

export async function getWordsFromNotion(timeRange: string | number): Promise<Word[]> {
  const config = getConfig();
  if (!config) {
    display.error('Configuration not found. Please run "nvq setup" or "vq setup" to set up your Notion connection.');
    process.exit(1);
  }

  // Validate database ID
  const databaseId = config.NOTION_DATABASE_ID;
  if (!databaseId) {
    display.error('Database ID is missing. Please run "nvq setup" or "vq setup" to configure your Notion database.');
    process.exit(1);
  }

  const notion = getNotionClient();

  try {
    // First verify if the database exists and is accessible
    try {
      await notion.databases.retrieve({ database_id: databaseId });
    } catch (dbError: any) {
      const errorMessage = `Unable to access your Notion database. Here are some things to check:

1. 🔍 Verify that the database ID "${databaseId}" is correct
2. 🔗 Make sure you've shared the database with your Notion integration
3. 🔐 Check that your integration has the necessary permissions

Need help? Run "nvq setup" to reconfigure your connection.`;
      if (dbError.code === 'object_not_found') {
        display.warning(errorMessage);
      } else {
        display.warning(errorMessage);
      }
      process.exit(1);
    }

    const selectedDate = getDateRange(timeRange);

    const response = (await notion.databases.query({
      database_id: databaseId,
      ...(selectedDate
        ? {
            filter: {
              property: 'Created time',
              date: {
                equals: selectedDate,
              },
            },
          }
        : undefined),
    })) as QueryDatabaseResponse;

    if (response?.results?.length === 0) {
      if (selectedDate) {
        display.info(`📅 No words found for ${selectedDate}. Try a different date or time range.`);
      } else {
        display.info('📚 No words found in your database. Add some words to get started!');
      }
      return [];
    }

    const data = response.results as PageObjectResponse[];
    const words: Word[] = [];

    for (const item of data) {
      const properties = item.properties as unknown as NotionProperties;
      try {
        const word = properties['Word'].title[0].text.content;
        const definitionVn = properties['Definition (VN)'].rich_text[0].text.content;
        const definitionEn = properties['Definition (EN)'].rich_text[0].text.content;
        const example = properties['Example'].rich_text[0]?.text.content || '';
        const synonyms = properties['Synonyms'].rich_text[0]?.text.content || '';
        const category = properties['Category'].select.name;
        const createdAt = properties['Created time']?.created_time || null;

        // Process rich text with formatting
        const getRichTextContent = (richText: any[]): string => {
          if (!richText || richText.length === 0) return '';
          return richText
            .map((text) => {
              if (text.text) return text.text.content;
              if (text.plain_text) return text.plain_text;
              return '';
            })
            .join('');
        };

        const note = getRichTextContent(properties['Note']?.rich_text || []);
        const synonymsList = synonyms
          ? synonyms
              .split('\n')
              .map((s) => s.trim())
              .filter((s) => s)
          : [];

        words.push({
          word,
          definitionVn,
          definitionEn,
          example,
          synonyms: synonymsList,
          category,
          createdAt,
          note,
        });
      } catch (e) {
        display.error(`Error processing data: ${(e as Error).message}`);
        continue;
      }
    }

    return words;
  } catch (error: any) {
    if (error.code === 'unauthorized') {
      display.error(`❌ Authentication failed. Your Notion API token may be invalid or expired.

Please run "nvq setup" to update your credentials.`);
    } else if (error.code === 'rate_limited') {
      display.error(`⏱️ Rate limit exceeded. Notion has temporarily limited your requests.

Please try again in a few minutes.`);
    } else {
      display.error(`❌ An unexpected error occurred: ${(error as Error).message}

If this persists, please run "nvq setup" to reconfigure your connection.`);
    }
    return [];
  }
}
