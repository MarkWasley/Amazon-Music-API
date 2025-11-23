/**
 * Extract release date from header tertiary text
 * @param {string} text - Header tertiary text like "12 SONGS  •  54 MINUTES  •  APR 03 2013"
 * @returns {string|null} - Release date or null if not found
 */
export function extractReleaseDateFromText(text: string | null): string | null {
  if (!text || typeof text !== "string") return null;

  try {
    // Match date patterns like "APR 03 2013", "JAN 15 2020", etc.
    const dateMatch = text.match(/([A-Z]{3}\s+\d{1,2}\s+\d{4})/i);

    return dateMatch ? dateMatch[1] : null;
  } catch (error) {
    return null;
  }
}