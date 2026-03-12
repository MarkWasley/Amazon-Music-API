// Multi-region album fetcher. Thin wrapper around the shared fetchMultiRegion utility.

import { fetchMultiRegion, RegionFetchResult } from '../../../common/helpers/regionFetch.js'

/** Quick check if the Amazon album response indicates an error / unavailable album */
function isAlbumErrorResponse(data: Record<string, unknown>): boolean {
    if ('onError' in data) return true

    const methods = data.methods as Array<Record<string, unknown>> | undefined
    if (!methods || methods.length === 0) return true

    const firstMethod = methods[0]
    const template = firstMethod?.template as Record<string, unknown> | undefined

    // Service error dialog
    const iface = template?.interface as string | undefined
    if (iface?.includes('DialogTemplate') && template?.header === 'Service error') return true

    const widgets = template?.widgets as unknown[] | undefined
    if (Array.isArray(widgets) && widgets.length === 0) return true

    const templateData = template?.templateData as Record<string, unknown> | undefined
    if (templateData?.deeplink === '/') return true

    return false
}

/**
 * Fetch an album with automatic multi-region resolution.
 *
 * - If `domainHint` is provided (extracted from a URL), tries that region's endpoint first.
 * - If the hint fails or no hint is given, concurrently fetches from all domains
 *   and returns the first valid response via Promise.any.
 */
export async function fetchAlbumMultiRegion(albumId: string, domainHint?: string): Promise<RegionFetchResult> {
    return fetchMultiRegion({
        id: albumId,
        apiPath: '/api/showCatalogAlbum',
        urlPathSegment: 'albums',
        entityName: 'Album',
        domainHint,
        isErrorResponse: isAlbumErrorResponse
    })
}
