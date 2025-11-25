import axios from 'axios'
import { buildAmazonHeaders, DEFAULT_HEADERS } from '../../../common/constants/defaultHeaders.js'
import { createError } from '../../../utils/createError.js'
import { DetailsArtist } from '../models/artist.model.js'
import { ENDPOINTS } from '../../../common/constants/endpoints.js'
import { durationToSeconds } from '../../../utils/durationToSeconds.js'
import { cleanImageUrl } from '../../../utils/cleanImageUrl.js'
import { DetailsSong } from '../../songs/models/song.model.js'

/**
 * Check if this is an invalid artist response (error message template)
 * @param {object} data - API response data
 * @returns {boolean} - True if invalid artist response
 */
function isInvalidArtistResponse(data: any) {
    if (!data.methods || !data.methods.length) return true

    const firstMethod = data.methods[0]

    // Check for error message template
    const isErrorMessage =
        firstMethod.template?.interface?.includes('MessageTemplate') &&
        firstMethod.template?.header === "We're Sorry" &&
        firstMethod.template?.message?.includes('We are unable to complete your action')

    return isErrorMessage
}

/**
 * Remove numbering prefix from song title
 * @param {string} title - Song title with numbering like "1. Chikiri Chikiri"
 * @returns {string} - Clean song title
 */
function cleanSongTitle(title: string) {
    if (!title) return null

    // Remove patterns like "1. ", "2. ", "10. " from beginning
    return title.replace(/^\d+\.\s*/, '')
}

export const createArtistPayload = async (data: any, config: any, artistId: string): Promise<DetailsArtist> => {
    // Check if this is an invalid artist response (service error)
    if (isInvalidArtistResponse(data)) {
        throw createError('Artist not found or service error', 404, 'ArtistNotFound')
    }

    const artist = data.methods[0].template

    const widgets = artist.widgets || []

    const topSongsWidget = widgets.find((widget: any) => widget.header?.toLowerCase().includes('top songs'))

    // ---------------------------
    // Artist Top Tracks (Optimized)
    // ---------------------------
    const albumCache = new Map<string, any>()

    // Collect unique album IDs
    const uniqueAlbums = new Set<string>()

    topSongsWidget.items.forEach((item: any) => {
        const storageKey = item.iconButton?.observer?.storageKey
        if (storageKey) {
            const [albumId] = storageKey.split(':')
            if (albumId) uniqueAlbums.add(albumId)
        }
    })

    const albumIds = Array.from(uniqueAlbums)

    // Function to fetch album data
    const fetchAlbumData = async (albumId: string) => {
        try {
            const headers = buildAmazonHeaders(config, `https://music.amazon.com/albums/${encodeURIComponent(albumId)}`)

            const body = {
                id: albumId,
                userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' }),
                headers: JSON.stringify(headers)
            }

            const songAlbumData = await axios.post(ENDPOINTS.ALBUM_INFO, body, {
                headers: DEFAULT_HEADERS,
                timeout: 1500
            })

            return songAlbumData.data
        } catch (err: any) {
            console.log(`❌ Failed album ${albumId}: ${err.message}`)
            return null
        }
    }

    // ---------------------------
    // Parallel Fetch with Concurrency Control
    // ---------------------------
    const CONCURRENT_REQUESTS = 8

    // Fetch all albums in parallel with a max of 8 concurrent requests
    const allResults = await Promise.allSettled(
        albumIds.map(async (albumId) => {
            const data = await fetchAlbumData(albumId)
            return { albumId, data }
        })
    )

    // Process results with rate-limiting awareness
    allResults.forEach((result) => {
        if (result.status === 'fulfilled') {
            const { albumId, data } = result.value
            if (data) {
                const widgets = data?.methods?.[0]?.template?.widgets?.[0]
                albumCache.set(albumId, widgets?.items || [])
            } else {
                albumCache.set(albumId, []) // fallback
            }
        }
    })

    // ---------------------------
    // Build Final Songs
    // ---------------------------
    const topSongs: DetailsSong[] = await Promise.all(
        topSongsWidget.items.map(async (item: any) => {
            const [albumId, trackId] = item.iconButton.observer.storageKey.split(':')

            // Pull cached album tracks
            const albumTracks = albumCache.get(albumId) || []

            // Extract duration
            let duration = 0

            const albumTrack = albumTracks.find((track: any) => {
                const deeplink = track.primaryTextLink?.deeplink
                if (!deeplink) return false
                const id = deeplink.split('/tracks/')[1]?.split('/')[0]
                return id === trackId
            })

            if (albumTrack) {
                duration = durationToSeconds(albumTrack.secondaryText3 || '')
            }

            return {
                id: trackId,
                title: cleanSongTitle(item.primaryText?.text) || null,
                url: `https://music.amazon.com/tracks/${encodeURIComponent(trackId)}`,
                image: cleanImageUrl(item.image),
                duration,
                album: {
                    id: albumId,
                    name: item.contextMenu.options[0]?.onItemSelected[1]?.template.headerText.text || null,
                    url: `https://music.amazon.com/albums/${encodeURIComponent(albumId)}`
                },
                artist: {
                    id: artistId,
                    name: item.secondaryText || null,
                    url:
                        item.contextMenu.options[1]?.onItemSelected?.[2]?.template?.templateData?.seoHead?.link?.[0]
                            ?.href || null
                }
            }
        })
    )

    // Filter out null results
    const filteredTopSongs = topSongs.filter((song) => song !== null)

    const info: DetailsArtist = {
        id: artistId,
        name: artist.headerText?.text || null,
        url: `https://music.amazon.com/artists/${encodeURIComponent(artistId)}`,
        image: cleanImageUrl(artist.backgroundImage || null),
        topSongs: filteredTopSongs
    }

    return info
}
