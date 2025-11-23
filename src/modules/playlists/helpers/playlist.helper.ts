import { cleanImageUrl } from '../../../utils/cleanImageUrl.js'
import { createError } from '../../../utils/createError.js'
import { durationToSeconds } from '../../../utils/durationToSeconds.js'
import { extractDurationFromText } from '../../../utils/extractDurationFromText.js'
import { extractSongsCountFromText } from '../../../utils/songsCountExtractor.js'
import { DetailsSong } from '../../songs/models/song.model.js'
import { DetailsPlaylist } from '../models/playlist.model.js'

// Helper to detect invalid/unavailable playlist responses
export function isInvalidPlaylistResponse(data: any): boolean {
    if (!data || !data.methods || data.methods.length === 0) return true

    const firstMethod = data.methods[0]
    const secondMethod = data.methods[1]

    // 1. First method template exists but widgets are empty → invalid playlist
    const widgets = firstMethod?.template?.widgets
    if (Array.isArray(widgets) && widgets.length === 0) return true

    // 2. Check for playlist error notification in second method
    const notificationMessage =
        secondMethod?.notification?.message?.text || secondMethod?.notification?.message?.innerHTML || null

    if (notificationMessage && notificationMessage.toLowerCase().includes('playlist is no longer available')) {
        return true
    }

    // 3. Check for homepage deeplink redirect pattern
    const deeplink = firstMethod?.template?.templateData?.deeplink
    if (deeplink === '/') return true

    return false
}

export const createPlaylistPayload = (data: any, playlistId: string): DetailsPlaylist => {
    if (isInvalidPlaylistResponse(data)) {
        throw createError('Invalid or unavailable playlist ID.', 404, 'PlaylistNotFound')
    }

    const playlist = data.methods[0].template

    let songs: DetailsSong[] = []
    if (playlist.widgets && playlist.widgets.length > 0 && playlist.widgets[0].items) {
        songs = playlist.widgets[0].items.map((item: any) => {
            const [albumId, trackId] = item.iconButton.observer.storageKey.split(':')
            const artistId = item.secondaryText1Link?.deeplink?.split('/artists/')[1]?.split('/')[0] || null

            return {
                id: trackId,
                name: item.primaryText || null,
                url: trackId ? `https://music.amazon.com/tracks/${encodeURIComponent(trackId)}` : null,
                image: cleanImageUrl(item.image || null),
                duration: durationToSeconds(item.secondaryText3 || null),
                album: {
                    id: albumId,
                    name: item.secondaryText2,
                    url: albumId ? `https://music.amazon.com/albums/${encodeURIComponent(albumId)}` : null
                },
                artist: {
                    id: artistId,
                    name: item.secondaryText1,
                    url: item.secondaryText1Link?.deeplink
                        ? `https://music.amazon.com${item.secondaryText1Link.deeplink}`
                        : null
                }
            }
        })
    }

    const info: DetailsPlaylist = {
        id: playlistId,
        name: playlist.headerText.text,
        url: `https://music.amazon.com/playlists/${encodeURIComponent(playlistId)}`,
        image: playlist.headerImage || null,
        totalSongs: extractSongsCountFromText(playlist.headerTertiaryText || ''),
        totalDuration: extractDurationFromText(playlist.headerTertiaryText || ''),
        createdBy: 'Amazon Music',
        songs
    }

    return info
}
