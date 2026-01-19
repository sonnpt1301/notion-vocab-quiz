import fs from 'fs';
import path from 'path';
import { askQuestion, display } from '../utils/utils';
import chalk from 'chalk';

interface Config {
  NOTION_TOKEN: string;
  NOTION_DATABASE_ID: string;
}

const CONFIG_FILE = path.join(process.env.HOME || process.env.USERPROFILE || '', '.notion-vocab-quiz', 'config.json');

export function getConfig(): Config | null {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return config;
    }
  } catch (error: any) {
    display.error('Error reading config file');
  }
  return null;
}

export function saveConfig(config: Config): void {
  try {
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    display.success('Configuration saved successfully!');
  } catch (error) {
    display.error('Error saving config file');
    throw error;
  }
}

export async function setupConfig(): Promise<void> {
  display.title('\n⚙️  Setup Notion Quiz Configuration\n');

  const token = await askQuestion(chalk.yellow('👉 Enter your Notion API token: '));
  const databaseId = await askQuestion(chalk.yellow('👉 Enter your Notion database ID: '));

  const config: Config = {
    NOTION_TOKEN: token,
    NOTION_DATABASE_ID: databaseId,
  };

  saveConfig(config);
}
