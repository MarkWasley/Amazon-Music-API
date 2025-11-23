import { cleanImageUrl } from '../../../utils/cleanImageUrl.js'
import { createError } from '../../../utils/createError.js'
import { SearchArtist } from '../models/search-artist.model.js'

interface WidgetItem {
    iconButton?: {
        observer?: {
            storageKey: string
        }
    }
    primaryText?: {
        text: string
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
    image?: string
}

export const createSearchArtistPayload = (resp: any): SearchArtist[] => {
    const artists: SearchArtist[] = []

    // Add safety check for response structure
    if (!resp?.methods?.[0]?.template?.widgets?.[0]?.items) {
        throw createError('Invalid response structure for artists search', 500, 'InvalidResponseError')
    }

    const artistItems: WidgetItem[] = resp.methods[0].template.widgets[0].items

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

    const items = artistItems
        .map((item: WidgetItem) => {
            const artistId = item.iconButton?.observer?.storageKey || null

            if (!artistId) return null

            return {
                id: artistId,
                name: item.primaryText?.text || 'Unknown Artist',
                url: artistId ? `https://music.amazon.com/artists/${artistId}` : null,
                image: cleanImageUrl(item.image || null)
            }
        })
        .filter((item): item is SearchArtist => item !== null)

    if (items.length === 0) {
        throw createError('No artists found for the given search query', 404, 'NoArtistsFound')
    }

    // Push all valid items to the artists array
    artists.push(...items)

    return artists
}

export const createSearchArtistPagePayload = (resp: any): SearchArtist[] => {
    const artists: SearchArtist[] = []

    // Add safety check for pagination response structure
    if (!resp?.methods?.[0]?.items) {
        throw createError('Invalid response structure for artists pagination', 500, 'InvalidResponseError')
    }

    const artistItems: PaginationWidgetItem[] = resp.methods[0].items

    // Extract next token for pagination
    let nextTokenForPagination = null
    if (resp.methods[0].onEndOfWidget && resp.methods[0].onEndOfWidget[0]) {
        const onEndOfWidgetUrl = resp.methods[0].onEndOfWidget[0].url
        if (onEndOfWidgetUrl) {
            const urlParams = new URLSearchParams(onEndOfWidgetUrl.split('?')[1])
            nextTokenForPagination = urlParams.get('next')
        }
    }

    const items = artistItems
        .map((item: PaginationWidgetItem) => {
            const artistId = item.iconButton?.observer?.storageKey || null

            if (!artistId) return null

            return {
                id: artistId,
                name: item.primaryText?.text || 'Unknown Artist',
                url: artistId ? `https://music.amazon.com/artists/${artistId}` : null,
                image: cleanImageUrl(item.image || null)
            }
        })
        .filter((item): item is SearchArtist => item !== null)

    if (items.length === 0) {
        throw createError('No artists found for the given search query and page', 404, 'NoArtistsFound')
    }

    // Push all valid items to the artists array
    artists.push(...items)

    return artists
}
