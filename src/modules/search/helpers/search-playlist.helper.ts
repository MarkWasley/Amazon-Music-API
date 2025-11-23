import { cleanImageUrl } from '../../../utils/cleanImageUrl.js'
import { createError } from '../../../utils/createError.js'
import { SearchPlaylist } from '../models/search-playlist.model.js'

interface WidgetItem {
    iconButton?: {
        observer?: {
            storageKey: string
        }
    }
    primaryText?: {
        observer?: {
            defaultValue?: {
                text: string
            }
        }
        text?: string
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
        observer?: {
            defaultValue?: {
                text: string
            }
        }
        text?: string
    }
    image?: string
}

export const createSearchPlaylistPayload = (resp: any): SearchPlaylist[] => {
    const playlists: SearchPlaylist[] = []

    // Add safety check for response structure
    if (!resp?.methods?.[0]?.template?.widgets?.[0]?.items) {
        throw createError('Invalid response structure for playlists search', 500, 'InvalidResponseError')
    }

    const playlistItems: WidgetItem[] = resp.methods[0].template.widgets[0].items

    // Extract next token for pagination
    let nextTokenForPagination = null
    if (resp.methods[0].template.widgets[0].onEndOfWidget) {
        const onEndOfWidgetUrl = resp.methods[0].template.widgets[0].onEndOfWidget[0].url
        const urlParams = new URLSearchParams(onEndOfWidgetUrl.split('?')[1])
        nextTokenForPagination = urlParams.get('next')
    }

    const items = playlistItems
        .map((item: WidgetItem) => {
            const playlistId = item.iconButton?.observer?.storageKey || null

            if (!playlistId) return null

            return {
                id: playlistId,
                name: item.primaryText?.observer?.defaultValue?.text || item.primaryText?.text || 'Unknown Playlist',
                url: playlistId ? `https://music.amazon.com/playlists/${playlistId}` : null,
                image: cleanImageUrl(item.image || null),
                createdBy: 'Amazon Music'
            }
        })
        .filter((item): item is SearchPlaylist => item !== null)

    if (items.length === 0) {
        throw createError('No playlists found for the given search query', 404, 'NoPlaylistsFound')
    }

    // Push all valid items to the playlists array
    playlists.push(...items)

    return playlists
}

export const createSearchPlaylistPagePayload = (resp: any): SearchPlaylist[] => {
    const playlists: SearchPlaylist[] = []

    // Add safety check for pagination response structure
    if (!resp?.methods?.[0]?.items) {
        throw createError('Invalid response structure for playlists pagination', 500, 'InvalidResponseError')
    }

    const playlistItems: PaginationWidgetItem[] = resp.methods[0].items

    // Extract next token for pagination
    let nextTokenForPagination = null
    if (resp.methods[0].onEndOfWidget && resp.methods[0].onEndOfWidget[0]) {
        const onEndOfWidgetUrl = resp.methods[0].onEndOfWidget[0].url
        if (onEndOfWidgetUrl) {
            const urlParams = new URLSearchParams(onEndOfWidgetUrl.split('?')[1])
            nextTokenForPagination = urlParams.get('next')
        }
    }

    const items = playlistItems
        .map((item: PaginationWidgetItem) => {
            const playlistId = item.iconButton?.observer?.storageKey || null

            if (!playlistId) return null

            return {
                id: playlistId,
                name: item.primaryText?.observer?.defaultValue?.text || item.primaryText?.text || 'Unknown Playlist',
                url: playlistId ? `https://music.amazon.com/playlists/${playlistId}` : null,
                image: cleanImageUrl(item.image || null),
                createdBy: 'Amazon Music'
            }
        })
        .filter((item): item is SearchPlaylist => item !== null)

    if (items.length === 0) {
        throw createError('No playlists found for the given search query', 404, 'NoPlaylistsFound')
    }

    // Push all valid items to the playlists array
    playlists.push(...items)

    return playlists
}
