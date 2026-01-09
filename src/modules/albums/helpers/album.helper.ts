import { createError } from '../../../utils/createError.js'
import { durationToSeconds } from '../../../utils/durationToSeconds.js'
import { extractDurationFromText } from '../../../utils/extractDurationFromText.js'
import { extractReleaseDateFromText } from '../../../utils/releaseDateExtractor.js'
import { extractSongsCountFromText } from '../../../utils/songsCountExtractor.js'
import { DetailsSong } from '../../songs/models/song.model.js'
import { DetailsAlbum } from '../models/album.model.js'

// Helper function to detect invalid album responses
function isInvalidAlbumResponse(data: any) {
    // Check if this is the service error dialog response
    if (!data.methods || !data.methods.length) return true

    const firstMethod = data.methods[0]

    // Check for service error dialog
    const isServiceError =
        firstMethod.template?.interface?.includes('DialogTemplate') && firstMethod.template?.header === 'Service error'

    return isServiceError
}

export const createAlbumPayload = (data: any, albumId: string): DetailsAlbum => {
    // Check if this is an invalid album response (service error)
    if (isInvalidAlbumResponse(data)) {
        throw createError('Album not found or service error', 404, 'AlbumNotFound')
    }

    const album = data.methods[0].template

    const artistId = album.headerPrimaryTextLink?.deeplink?.split('/artists/')[1]?.split('/')[0] || null

    let songs: DetailsSong[] = []
    if (album.widgets && album.widgets.length > 0 && album.widgets[0].items) {
        songs = album.widgets[0].items.map((item: any) => {
            const trackId = item.primaryTextLink?.deeplink?.split('/tracks/')[1] || null
            const artistIdFromItem =
                item.secondaryText2Link?.deeplink?.split('/artists/')[1]?.split('/')[0] || artistId || null

            return {
                id: trackId,
                name: item.primaryText || null,
                url: trackId ? `https://music.amazon.com/tracks/${encodeURIComponent(trackId)}` : null,
                image: album.headerImage || null,
                duration: durationToSeconds(item.secondaryText3 || null),
                isrc: null,
                album: {
                    id: albumId,
                    name: album.headerText?.text || null,
                    url: `https://music.amazon.com/albums/${encodeURIComponent(albumId)}`
                },
                artist: {
                    id: artistIdFromItem,
                    name: item.secondaryText2 || album.headerPrimaryText || null,
                    url: item.secondaryText2Link?.deeplink
                        ? `https://music.amazon.com${item.secondaryText2Link.deeplink}`
                        : album.headerPrimaryTextLink?.deeplink
                          ? `https://music.amazon.com${album.headerPrimaryTextLink.deeplink}`
                          : null
                }
            }
        })
    }

    const info: DetailsAlbum = {
        id: albumId,
        name: album.headerText?.text || null,
        url: `https://music.amazon.com/albums/${encodeURIComponent(albumId)}`,
        image: album.headerImage || null,
        totalSongs: extractSongsCountFromText(album.headerTertiaryText || ''),
        totalDuration: extractDurationFromText(album.headerTertiaryText || '') || null,
        releaseDate: extractReleaseDateFromText(album.headerTertiaryText || ''),
        artist: {
            id: artistId,
            name: album.headerPrimaryText || null,
            url: album.headerPrimaryTextLink?.deeplink
                ? `https://music.amazon.com${album.headerPrimaryTextLink.deeplink}`
                : null
        },
        songs: songs
    }

    return info
}
