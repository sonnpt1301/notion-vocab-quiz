import fs from 'fs';
import { Word } from '../interfaces';

function getShortCategory(category: string): string {
  // Find pattern "Word (short)" or "Word (short) - description"
  const match = category.match(/^([^(]+)\s*\(([^)]+)\)/);
  if (match) {
    return match[2].trim(); // Return the short part in parentheses
  }
  return category; // If no pattern, return the original
}

export function exportToCSV(words: Word[], outputPath: string): void {
  try {
    const csvContent = ['Word (word type) - Definition (VN)'];

    words.forEach((word) => {
      const shortCategory = getShortCategory(word.category);
      const row = `${word.word} (${shortCategory}) - ${word.definitionVn}`;
      csvContent.push(row);
    });

    fs.writeFileSync(outputPath, csvContent.join('\n'), 'utf-8');
  } catch (error: any) {
    throw new Error(`Failed to export CSV: ${(error as Error).message}`);
  }
}
