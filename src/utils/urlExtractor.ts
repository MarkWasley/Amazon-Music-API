export function extractUrl(url: string): { type: string; id: string } | null {
    // Return null if input is invalid
    if (!url || typeof url !== 'string') return null

    try {
        // Remove query parameters and hash fragments from URL
        const cleanUrl = url.split('?')[0].split('#')[0]

        // Define entity patterns to match
        const entityPatterns = [
            { type: 'track', pattern: /\/tracks\/([A-Z0-9]{10,15})/ },
            { type: 'album', pattern: /\/albums\/([A-Z0-9]{10,15})/ },
            { type: 'artist', pattern: /\/artists\/([A-Z0-9]{10,15})/ },
            { type: 'playlist', pattern: /\/playlists\/([A-Z0-9]{10,15})/ },
            { type: 'user-playlist', pattern: /\/user-playlists\/([a-zA-Z0-9]+)/ }
        ]

        // Check each entity pattern against the URL
        for (const entity of entityPatterns) {
            const match = cleanUrl.match(entity.pattern)
            if (match && match[1]) {
                return {
                    type: entity.type,
                    id: match[1]
                }
            }
        }

        return null
    } catch (error) {
        return null
    }
}
