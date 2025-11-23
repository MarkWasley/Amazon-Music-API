import { SearchAlbum } from '../models/search-album.model.js'
import { cleanImageUrl } from '../../../utils/cleanImageUrl.js'
import { createError } from '../../../utils/createError.js'

interface WidgetItem {
    iconButton?: {
        observer?: {
            storageKey: string
        }
    }
    primaryText?: {
        text: string
    }
    primaryLink?: {
        deeplink: string
    }
    secondaryText?: string
    secondaryLink?: {
        deeplink: string
    }
    image?: string
}

interface PaginationWidgetItem {
    iconButton?: {
        observer?: {
            storageKey: string
        }
    }
    primaryText?: {
        text: string
    }
    secondaryText?: string
    secondaryLink?: {
        deeplink: string
    }
    image?: string
}

export const createSearchAlbumPayload = (resp: any): SearchAlbum[] => {
    const albums: SearchAlbum[] = []

    // Add safety check for response structure
    if (!resp?.methods?.[0]?.template?.widgets?.[0]?.items) {
        throw createError('Invalid response structure for albums search', 500, 'InvalidResponseError')
    }

    const albumItems: WidgetItem[] = resp.methods[0].template.widgets[0].items

    // Extract next token for pagination
    let nextTokenForPagination = null
    if (
        resp.methods[0].template.widgets &&
        resp.methods[0].template.widgets[0].onEndOfWidget &&
        resp.methods[0].template.widgets[0].onEndOfWidget[0]
    ) {
        const onEndOfWidgetUrl = resp.methods[0].template.widgets[0].onEndOfWidget[0].url
        if (onEndOfWidgetUrl) {
            const urlParams = new URLSearchParams(onEndOfWidgetUrl.split('?')[1])
            nextTokenForPagination = urlParams.get('next')
        }
    }

    const items = albumItems
        .map((item: WidgetItem) => {
            // Extract album ID from storageKey or primaryLink
            const albumId =
                item.iconButton?.observer?.storageKey ||
                item.primaryLink?.deeplink?.split('/albums/')[1]?.split('/')[0] ||
                null

            if (!albumId) return null

            // Extract artist ID from secondaryLink
            const artistId = item.secondaryLink?.deeplink?.split('/artists/')[1]?.split('/')[0] || null

            return {
                id: albumId,
                name: item.primaryText?.text || 'Unknown Album',
                url: albumId ? `https://music.amazon.com/albums/${albumId}` : null,
                image: cleanImageUrl(item.image || null),
                artist: {
                    id: artistId,
                    name: item.secondaryText || 'Unknown Artist',
                    url: item.secondaryLink ? `https://music.amazon.com${item.secondaryLink.deeplink || ''}` : null
                }
            }
        })
        .filter((item): item is SearchAlbum => item !== null)

    if (items.length === 0) {
        throw createError('No albums found for the given search query', 404, 'NoAlbumsFound')
    }

    // Push all valid items to the albums array
    albums.push(...items)

    return albums
}

export const createSearchAlbumPagePayload = (resp: any): SearchAlbum[] => {
    const albums: SearchAlbum[] = []

    // Add safety check for pagination response structure
    if (!resp?.methods?.[0]?.items) {
        throw createError('Invalid response structure for albums pagination', 500, 'InvalidResponseError')
    }

    const albumItems: PaginationWidgetItem[] = resp.methods[0].items

    // Extract next token for pagination
    let nextTokenForPagination = null
    if (resp.methods[0].onEndOfWidget && resp.methods[0].onEndOfWidget[0]) {
        const onEndOfWidgetUrl = resp.methods[0].onEndOfWidget[0].url
        if (onEndOfWidgetUrl) {
            const urlParams = new URLSearchParams(onEndOfWidgetUrl.split('?')[1])
            nextTokenForPagination = urlParams.get('next')
        }
    }

    const items = albumItems
        .map((item: PaginationWidgetItem) => {
            const albumId = item.iconButton?.observer?.storageKey || null

            if (!albumId) return null

            // Extract artist ID from secondaryLink
            const artistId = item.secondaryLink?.deeplink?.split('/artists/')[1]?.split('/')[0] || null

            return {
                id: albumId,
                name: item.primaryText?.text || 'Unknown Album',
                url: albumId ? `https://music.amazon.com/albums/${albumId}` : null,
                image: cleanImageUrl(item.image || null),
                artist: {
                    id: artistId,
                    name: item.secondaryText || 'Unknown Artist',
                    url: item.secondaryLink ? `https://music.amazon.com${item.secondaryLink.deeplink || ''}` : null
                }
            }
        })
        .filter((item): item is SearchAlbum => item !== null)

    if (items.length === 0) {
        throw createError('No albums found for the given search query on this page', 404, 'NoAlbumsFound')
    }

    // Push all valid items to the albums array
    albums.push(...items)

    return albums
}
