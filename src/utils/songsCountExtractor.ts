export /**
 * Extract songs count from header tertiary text
 * @param {string} text - Header tertiary text like "12 SONGS  •  54 MINUTES  •  APR 03 2013"
 * @returns {number|null} - Number of songs or null if not found
 */
function extractSongsCountFromText(text: string | null): number | null {
    if (!text || typeof text !== 'string') return null

    try {
        // Match patterns like "12 SONGS", "1 SONG", "5 songs", etc.
        const songsMatch = text.match(/(\d+)\s*SONGS?/i)

        if (songsMatch && songsMatch[1]) {
            return parseInt(songsMatch[1])
        }

        return null
    } catch (error) {
        return null
    }
}
