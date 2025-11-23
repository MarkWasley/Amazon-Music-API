export function cleanImageUrl(url: string | null): string | null {
    if (!url) return null

    if (url.includes('_CLa%7C')) {
        return (
            url
                // Remove quality restrictions
                .replace(/\._AA\d+\.jpg$/, '.jpg')
                // Increase size from 354 to 1000
                .replace(/_(US|SX|SY)\d+/, '_US1000')
                .replace(/CLa%7C354,354/, 'CLa%7C1000,1000')
                // Replace all coordinate patterns
                .replace(/0,0,354,354/g, '0,0,1000,1000')
                .replace(/0,0,177,177/g, '0,0,500,500')
                .replace(/177,0,177,177/g, '500,0,500,500')
                .replace(/0,177,177,177/g, '0,500,500,500')
                .replace(/177,177,177,177/g, '500,500,500,500')
                // Fix the specific patterns that were missed
                .replace(/177,0,500,500/g, '500,0,500,500')
                .replace(/0,500,500,177/g, '0,500,500,500')
                .replace(/500,500,500,177/g, '500,500,500,500')
        )
    }

    return url.replace(/(\/I\/[A-Za-z0-9\-]+).*?(\.[^\.]+)$/, "$1$2");
}
