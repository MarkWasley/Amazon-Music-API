export function durationToSeconds(durationString: string | null): number {
    if (!durationString) return 0

    const cleanString = durationString.trim()

    try {
        // Handle HH:MM:SS format
        if (cleanString.match(/^\d+:\d+:\d+$/)) {
            const [hours, minutes, seconds] = cleanString.split(':').map(Number)
            return hours * 3600 + minutes * 60 + seconds
        }

        // Handle MM:SS format or HH:MM format (when minutes >= 60)
        if (cleanString.match(/^\d+:\d+$/)) {
            const [first, second] = cleanString.split(':').map(Number)

            // If first part is 60 or more, treat as HH:MM
            if (first >= 60) {
                const hours = Math.floor(first / 60)
                const minutes = first % 60
                return hours * 3600 + minutes * 60 + second
            } else {
                // Regular MM:SS
                return first * 60 + second
            }
        }

        // Handle plain number (seconds)
        if (cleanString.match(/^\d+$/)) {
            return Number(cleanString)
        }

        return 0
    } catch (error) {
        return 0
    }
}
