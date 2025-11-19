import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse streaming response in text-delta format
 * @param fullResponse - The complete streaming response
 * @returns Extracted text from all text-delta events
 */
export function parseStreamingResponse(fullResponse: string): string {
  const lines = fullResponse.split('\n').filter(line => line.trim());
  let extractedText = '';

  for (const line of lines) {
    try {
      // Remove 'data: ' prefix if present
      const jsonStr = line.startsWith('data: ') ? line.substring(6) : line;

      // Skip [DONE] marker
      if (jsonStr === '[DONE]') continue;

      // Try to parse as JSON first (for text-delta format)
      const data = JSON.parse(jsonStr);
      if (data.type === 'text-delta' && data.delta) {
        extractedText += data.delta;
      } else if (data.text) {
        // Handle other JSON formats with text field
        extractedText += data.text;
      }
    } catch (e) {
      // If it's not JSON, treat as plain text
      const plainText = line.startsWith('data: ') ? line.substring(6) : line;
      if (plainText && plainText !== '[DONE]') {
        extractedText += plainText;
      }
    }
  }

  return extractedText.trim();
}

/**
 * Parse and clean synonym list from AI response
 * @param text - Raw text containing synonyms
 * @param maxCount - Maximum number of synonyms to return (default: 6)
 * @returns Array of cleaned synonym strings
 */
export function parseSynonyms(text: string, maxCount: number = 6): string[] {
  // Clean up the response first - remove common intro phrases
  let cleanedResponse = text
    .replace(/here are \d+ (alternatives|synonyms):?/gi, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  // Try to parse as comma-separated first
  let synonymList = cleanedResponse
    .split(',')
    .map(s => s.trim().replace(/^[\d\.]+\s*/, '').replace(/['\"]/g, '').trim())
    .filter(s => s.length > 0 && !s.toLowerCase().includes('alternative'));

  // If we got very few items, try parsing as numbered list
  if (synonymList.length < 5) {
    const numberedMatches = cleanedResponse.match(/\d+\.\s*([^\n]+)/g);
    if (numberedMatches && numberedMatches.length > 0) {
      synonymList = numberedMatches
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(s => s.length > 0);
    }
  }

  // Take only first maxCount and filter out any remaining junk
  return synonymList
    .slice(0, maxCount)
    .filter(s => !s.toLowerCase().match(/^(here|format|do not|give me|provide)/));
}

/**
 * Remove leading and trailing quotation marks from text
 * @param text - Text to clean
 * @returns Cleaned text without surrounding quotes
 */
export function cleanQuotationMarks(text: string): string {
  return text.replace(/^["']|["']$/g, '').trim();
}
