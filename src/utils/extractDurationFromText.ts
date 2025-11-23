export function extractDurationFromText(text: string | null): number | null {
    if (!text) return null

    // Try pattern: "X HOURS AND Y MINUTES"
    let durationMatch = text.match(/(\d+)\s*HOURS?\s*AND\s*(\d+)\s*MINUTES?/i)

    if (durationMatch && durationMatch.length >= 3) {
        const hours = parseInt(durationMatch[1])
        const minutes = parseInt(durationMatch[2])
        return hours * 3600 + minutes * 60
    }

    // Try: "X MINUTES AND Y SECONDS"
    durationMatch = text.match(/(\d+)\s*MINUTES?\s*AND\s*(\d+)\s*SECONDS?/i)

    if (durationMatch && durationMatch.length >= 3) {
        const minutes = parseInt(durationMatch[1])
        const seconds = parseInt(durationMatch[2])
        return minutes * 60 + seconds
    }

    // Try alternative pattern: "X:YZ" (MM:SS format)
    durationMatch = text.match(/(\d+):(\d+)/)
    if (durationMatch && durationMatch.length >= 3) {
        const minutes = parseInt(durationMatch[1])
        const seconds = parseInt(durationMatch[2])
        return minutes * 60 + seconds
    }

    // Try just minutes
    durationMatch = text.match(/(\d+)\s*MINUTES?/i)
    if (durationMatch) {
        const minutes = parseInt(durationMatch[1])
        return minutes * 60
    }

    return null
}
