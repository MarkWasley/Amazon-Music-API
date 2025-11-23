import { cleanImageUrl } from '../../../utils/cleanImageUrl.js'
import { createError } from '../../../utils/createError.js'
import { SearchCommunityPl } from '../models/search-community-pl.model.js'

interface WidgetItem {
    primaryText?: {
        observer?: {
            storageKey?: string
            defaultValue?: {
                text: string
            }
        }
    }
    secondaryText?: string
    image?: string
}

interface PaginationWidgetItem {
    primaryText?: {
        observer?: {
            storageKey?: string
            defaultValue?: {
                text: string
            }
        }
    }
    secondaryText?: string
    image?: string
}

export const createSearchCommunityPlaylistPayload = (resp: any): SearchCommunityPl[] => {
    const communityPlaylists: SearchCommunityPl[] = []

    // Add safety check for response structure
    if (!resp?.methods?.[0]?.template?.widgets?.[0]?.items) {
        throw createError('Invalid response structure for community playlists search', 500, 'InvalidResponseError')
    }

    const communityPlaylistItems: WidgetItem[] = resp.methods[0].template.widgets[0].items

    // Extract next token for pagination
    let nextTokenForPagination = null
    if (resp.methods[0].template.widgets[0].onEndOfWidget) {
        const onEndOfWidgetUrl = resp.methods[0].template.widgets[0].onEndOfWidget[0].url
        const urlParams = new URLSearchParams(onEndOfWidgetUrl.split('?')[1])
        nextTokenForPagination = urlParams.get('next')
    }

    const items = communityPlaylistItems
        .map((item: WidgetItem) => {
            const id = item.primaryText?.observer?.storageKey || null

            if (!id) return null

            return {
                id: id,
                name: item.primaryText?.observer?.defaultValue?.text || 'Unknown Community Playlist',
                url: id ? `https://music.amazon.com/user-playlists/${id}` : null,
                image: cleanImageUrl(item.image || null),
                createdBy: item.secondaryText || 'Amazon Music Community'
            }
        })
        .filter((item): item is SearchCommunityPl => item !== null)

    if (items.length === 0) {
        throw createError('No community playlists found for the given keyword', 404, 'NoCommunityPlaylistsFound')
    }

    // Push all valid items to the communityPlaylists array
    communityPlaylists.push(...items)

    return communityPlaylists
}

export const createSearchCommunityPlaylistPagePayload = (resp: any): SearchCommunityPl[] => {
    const communityPlaylists: SearchCommunityPl[] = []

    // Add safety check for pagination response structure
    if (!resp?.methods?.[0]?.items) {
        throw createError('Invalid response structure for community playlists pagination', 500, 'InvalidResponseError')
    }

    const communityPlaylistItems: PaginationWidgetItem[] = resp.methods[0].items

    // Extract next token for pagination
    let nextTokenForPagination = null
    if (resp.methods[0].onEndOfWidget && resp.methods[0].onEndOfWidget[0]) {
        const onEndOfWidgetUrl = resp.methods[0].onEndOfWidget[0].url
        if (onEndOfWidgetUrl) {
            const urlParams = new URLSearchParams(onEndOfWidgetUrl.split('?')[1])
            nextTokenForPagination = urlParams.get('next')
        }
    }

    const items = communityPlaylistItems
        .map((item: PaginationWidgetItem) => {
            const id = item.primaryText?.observer?.storageKey || null

            if (!id) return null

            return {
                id: id,
                name: item.primaryText?.observer?.defaultValue?.text || 'Unknown Community Playlist',
                url: id ? `https://music.amazon.com/user-playlists/${id}` : null,
                image: cleanImageUrl(item.image || null),
                createdBy: item.secondaryText || 'Amazon Music Community'
            }
        })
        .filter((item): item is SearchCommunityPl => item !== null)

    if (items.length === 0) {
        throw createError(
            'No community playlists found for the given keyword on this page',
            404,
            'NoCommunityPlaylistsFound'
        )
    }

    // Push all valid items to the communityPlaylists array
    communityPlaylists.push(...items)

    return communityPlaylists
}
