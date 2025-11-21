import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import validator from 'validator';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates input to prevent prompt injection and malicious content
 */
export function validateInput(input: string): { valid: boolean; error?: string } {
  // Check for empty or whitespace-only input
  if (!input || validator.isEmpty(input.trim())) {
    return { valid: false, error: 'Input cannot be empty' };
  }

  // Check length
  if (input.length > 1000) {
    return { valid: false, error: 'Input too long (max 1000 characters)' };
  }

  // Check for excessive special characters that might indicate injection attempts
  const specialCharCount = (input.match(/[<>{}[\]\\|]/g) || []).length;
  if (specialCharCount > 5) {
    return { valid: false, error: 'Input contains too many special characters' };
  }

  // Check for common prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
    /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
    /forget\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
    /new\s+instructions?:/gi,
    /system\s*:\s*/gi,
    /assistant\s*:\s*/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      return { valid: false, error: 'Input contains potentially malicious content' };
    }
  }

  // Check for script tags or HTML injection attempts
  if (/<script|javascript:|onerror=|onload=/gi.test(input)) {
    return { valid: false, error: 'Input contains potentially malicious content' };
  }

  return { valid: true };
}
