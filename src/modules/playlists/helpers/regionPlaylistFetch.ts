// Multi-region playlist fetcher. Thin wrapper around the shared fetchMultiRegion utility.

import { fetchMultiRegion, RegionFetchResult } from '../../../common/helpers/regionFetch.js'

/** Quick check if the Amazon response indicates an error / unavailable playlist */
function isPlaylistErrorResponse(data: Record<string, unknown>): boolean {
    if ('onError' in data) return true

    const methods = data.methods as Array<Record<string, unknown>> | undefined
    if (!methods || methods.length === 0) return true

    const firstMethod = methods[0]
    const template = firstMethod?.template as Record<string, unknown> | undefined

    const widgets = template?.widgets as unknown[] | undefined
    if (Array.isArray(widgets) && widgets.length === 0) return true

    const templateData = template?.templateData as Record<string, unknown> | undefined
    if (templateData?.deeplink === '/') return true

    // Check for "playlist is no longer available" notification in second method
    if (methods.length > 1) {
        const secondMethod = methods[1] as Record<string, unknown>
        const notification = secondMethod?.notification as Record<string, unknown> | undefined
        const message = notification?.message as Record<string, unknown> | undefined
        const text = (message?.text as string) || (message?.innerHTML as string) || ''
        if (text.toLowerCase().includes('playlist is no longer available')) return true
    }

    return false
}

/**
 * Fetch a playlist with automatic multi-region resolution.
 *
 * - If `domainHint` is provided (extracted from a URL), tries that region's endpoint first.
 * - If the hint fails or no hint is given, concurrently fetches from all domains
 *   and returns the first valid response via Promise.any.
 */
export async function fetchPlaylistMultiRegion(playlistId: string, domainHint?: string): Promise<RegionFetchResult> {
    return fetchMultiRegion({
        id: playlistId,
        apiPath: '/api/showCatalogPlaylist',
        urlPathSegment: 'playlists',
        entityName: 'Playlist',
        domainHint,
        isErrorResponse: isPlaylistErrorResponse
    })
}
