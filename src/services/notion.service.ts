import { Client } from '@notionhq/client';
import { PageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { NotionProperties, Word } from '../interfaces';
import { display } from '../utils';
import { getConfig } from './config.service';

dayjs.extend(utc);
dayjs.extend(timezone);
const userTimezone = dayjs.tz.guess();
dayjs.tz.setDefault(userTimezone);

let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!notionClient) {
    const config = getConfig();
    if (!config) {
      throw new Error('Please run "nvq setup" or "nvq setup" to configure your Notion credentials');
    }
    notionClient = new Client({
      auth: config.NOTION_TOKEN,
    });
  }
  return notionClient;
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
    throw new Error('Please run "nvq setup" or "nvq setup" to configure your Notion credentials');
  }

  const notion = getNotionClient();
  const databaseId = config.NOTION_DATABASE_ID;

  try {
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

    if (response?.results?.length === 0) return [];

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
    display.error(`Error when calling Notion API: ${(error as Error).message}`);
    return [];
  }
}
