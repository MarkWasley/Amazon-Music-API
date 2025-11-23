import axios from 'axios'
import { buildAmazonHeaders, DEFAULT_HEADERS } from '../../../common/constants/defaultHeaders.js'
import { cleanImageUrl } from '../../../utils/cleanImageUrl.js'
import { createError } from '../../../utils/createError.js'
import { durationToSeconds } from '../../../utils/durationToSeconds.js'
import { SearchSong } from '../models/search-song.model.js'
import { ENDPOINTS } from '../../../common/constants/endpoints.js'

interface WidgetItem {
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
    contextMenu?: {
        options?: Array<{
            onItemSelected?: any[]
        }>
    }
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
    contextMenu?: {
        options?: Array<{
            onItemSelected?: any[]
        }>
    }
}

export const createSearchSongsPayload = async (config: any, resp: any): Promise<SearchSong[]> => {
    const songs: SearchSong[] = []

    if (!resp?.methods?.[0]?.template?.widgets?.[0]?.items) {
        throw createError('Invalid response structure for songs search', 500, 'InvalidResponseError')
    }

    const songItems: WidgetItem[] = resp.methods[0].template.widgets[0].items

    // Request-level cache
    const albumDataCache = new Map()

    // Function to fetch album data
    const fetchAlbumData = async (albumId: string): Promise<any> => {
        try {
            const albumHeaders = buildAmazonHeaders(config, `https://music.amazon.com/albums/${albumId}`)

            const body = {
                id: albumId,
                userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' }),
                headers: JSON.stringify(albumHeaders)
            }

            const songAlbumData = await axios.post(ENDPOINTS.ALBUM_INFO, body, {
                headers: DEFAULT_HEADERS,
                timeout: 3000
            })

            return songAlbumData.data
        } catch (error: any) {
            console.log(`❌ Failed album ${albumId}: ${error.message}`)
            return null
        }
    }

    // Collect unique album IDs
    const uniqueAlbums = new Set()
    songItems.forEach((item) => {
        const storageKey = item.iconButton?.observer?.storageKey
        if (storageKey) {
            const [albumId] = storageKey.split(':')
            if (albumId) {
                uniqueAlbums.add(albumId)
            }
        }
    })

    const albumIds = Array.from(uniqueAlbums)

    // Fetch albums in batches of 3 with 200ms delay between batches
    const BATCH_SIZE = 3
    const DELAY_BETWEEN_BATCHES = 200

    for (let i = 0; i < albumIds.length; i += BATCH_SIZE) {
        const batch = albumIds.slice(i, i + BATCH_SIZE)

        // Process batch in parallel
        const batchPromises = batch.map((albumId) => fetchAlbumData(albumId as string))
        const batchResults = await Promise.all(batchPromises)

        // Store results in cache
        batch.forEach((albumId, index) => {
            if (batchResults[index]) {
                albumDataCache.set(albumId, batchResults[index])
            }
        })

        // Add delay between batches (except for last batch)
        if (i + BATCH_SIZE < albumIds.length) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
        }
    }

    // Process all songs with the fetched album data
    const items = songItems.map((item: WidgetItem) => {
        try {
            const storageKey = item.iconButton?.observer?.storageKey
            if (!storageKey) return null

            const [albumId, songId] = storageKey.split(':')
            if (!songId) return null

            let duration = 0
            const artistId = item.secondaryLink?.deeplink?.split('/artists/')[1]?.split('/')[0] || ''
            const artistName = item.secondaryText || 'Unknown Artist'

            // Use cached album data to find duration
            const albumData = albumDataCache.get(albumId)
            if (albumData?.methods?.[0]?.template?.widgets?.[0]) {
                const albumTracks = albumData.methods[0].template.widgets[0].items
                const albumTrack = albumTracks.find((track: any) => {
                    const trackDeeplink = track.primaryTextLink?.deeplink
                    if (trackDeeplink) {
                        const trackIdFromDeeplink = trackDeeplink.split('/tracks/')[1]?.split('/')[0]
                        return trackIdFromDeeplink === songId
                    }
                    return false
                })

                if (albumTrack) {
                    const durationString = albumTrack.secondaryText3 || ''
                    duration = durationToSeconds(durationString)
                }
            }

            const artistUrl = item.secondaryLink?.deeplink
                ? `https://music.amazon.com${item.secondaryLink.deeplink}`
                : null

            const albumUrl =
                item.contextMenu?.options?.[0]?.onItemSelected?.[1]?.template?.templateData?.seoHead?.link?.[0]?.href ||
                `https://music.amazon.com/albums/${albumId}`

            return {
                id: songId,
                title: item.primaryText?.text || 'Unknown Title',
                url: songId ? `https://music.amazon.com/tracks/${songId}` : null,
                image: cleanImageUrl(item.image || null),
                duration: duration,
                artist: {
                    id: artistId,
                    name: artistName,
                    url: artistUrl
                },
                album: {
                    id: albumId,
                    name:
                        item.contextMenu?.options?.[0]?.onItemSelected?.[1]?.template?.headerText?.text ||
                        'Unknown Album',
                    url: albumUrl
                }
            }
        } catch (itemError) {
            console.log(`Error processing song item`)
            return null
        }
    })

    const validItems = items.filter((item): item is SearchSong => item !== null)

    if (validItems.length === 0) {
        throw createError('No songs found for the given search query', 404, 'NoSongsError')
    }

    songs.push(...validItems)

    return songs
}

export const createSearchSongsPagePayload = async (config: any, resp: any): Promise<SearchSong[]> => {
    const songs: SearchSong[] = []

    if (!resp?.methods?.[0]?.items) {
        throw createError('Invalid response structure for songs pagination', 500, 'InvalidResponseError')
    }

    const songItems: PaginationWidgetItem[] = resp.methods[0].items

    // ⬇ Extract next pagination token (same as before but untouched)
    let nextTokenForPagination = null
    if (resp.methods[0].onEndOfWidget && resp.methods[0].onEndOfWidget[0]) {
        const onEndOfWidgetUrl = resp.methods[0].onEndOfWidget[0].url
        if (onEndOfWidgetUrl) {
            const urlParams = new URLSearchParams(onEndOfWidgetUrl.split('?')[1])
            nextTokenForPagination = urlParams.get('next')
        }
    }

    // -----------------------------------------
    // 1) CACHE + UNIQUE ALBUM IDS EXTRACTION
    // -----------------------------------------
    const albumDataCache = new Map()
    const uniqueAlbums = new Set()

    songItems.forEach((item) => {
        const storageKey = item.iconButton?.observer?.storageKey
        if (storageKey) {
            const [albumId] = storageKey.split(':')
            if (albumId) uniqueAlbums.add(albumId)
        }
    })

    const albumIds = Array.from(uniqueAlbums)

    // -----------------------------------------
    // 2) FUNCTION TO FETCH ALBUM DATA
    // -----------------------------------------
    const fetchAlbumData = async (albumId: string): Promise<any> => {
        try {
            const headers = buildAmazonHeaders(config, `https://music.amazon.com/albums/${albumId}`)

            const body = {
                id: albumId,
                userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' }),
                headers: JSON.stringify(headers)
            }

            const res = await axios.post(ENDPOINTS.ALBUM_INFO, body, {
                headers: DEFAULT_HEADERS,
                timeout: 3000
            })

            return res.data
        } catch (err: any) {
            console.log(`❌ Failed album ${albumId}: ${err.message}`)
            return null
        }
    }

    // -----------------------------------------
    // 3) BATCH FETCH ALBUMS (3 AT A TIME)
    // -----------------------------------------
    const BATCH_SIZE = 3
    const DELAY = 200

    for (let i = 0; i < albumIds.length; i += BATCH_SIZE) {
        const batch = albumIds.slice(i, i + BATCH_SIZE)

        const results = await Promise.all(
            batch.map((albumId) => fetchAlbumData(albumId as string))
        )

        batch.forEach((albumId, index) => {
            if (results[index]) albumDataCache.set(albumId, results[index])
        })

        if (i + BATCH_SIZE < albumIds.length) {
            await new Promise((res) => setTimeout(res, DELAY))
        }
    }

    // -----------------------------------------
    // 4) PROCESS SONG ITEMS USING CACHE
    // -----------------------------------------
    const items = await Promise.all(
        songItems.map(async (item: PaginationWidgetItem) => {
            try {
                const storageKey = item.iconButton?.observer?.storageKey
                if (!storageKey) return null

                const [albumId, trackId] = storageKey.split(':')
                if (!trackId) return null

                let duration = 0
                let albumName = 'Unknown Album'

                const artistId = item.secondaryLink?.deeplink?.split('/artists/')[1]?.split('/')[0] || ''
                const artistName = item.secondaryText || 'Unknown Artist'

                // ⬇ Use CACHE not API
                const albumData = albumDataCache.get(albumId)

                if (albumData?.methods?.[0]?.template) {
                    albumName = albumData.methods[0].template.headerText?.text || 'Unknown Album'
                }

                if (albumData?.methods?.[0]?.template?.widgets?.[0]) {
                    const albumTracks = albumData.methods[0].template.widgets[0].items

                    const albumTrack = albumTracks.find((track: any) => {
                        const trackDeeplink = track.primaryTextLink?.deeplink
                        if (trackDeeplink) {
                            const idFromLink = trackDeeplink.split('/tracks/')[1]?.split('/')[0]
                            return idFromLink === trackId
                        }
                        return false
                    })

                    if (albumTrack) {
                        const durationString = albumTrack.secondaryText3 || ''
                        duration = durationToSeconds(durationString)
                    }
                }

                const artistUrl = item.secondaryLink?.deeplink
                    ? `https://music.amazon.com${item.secondaryLink.deeplink}`
                    : null

                const albumUrl =
                    item.contextMenu?.options?.[0]?.onItemSelected?.[1]?.template?.templateData?.seoHead?.link?.[0]
                        ?.href || `https://music.amazon.com/albums/${albumId}`

                return {
                    id: trackId,
                    title: item.primaryText?.text || 'Unknown Title',
                    url: trackId ? `https://music.amazon.com/tracks/${trackId}` : null,
                    image: cleanImageUrl(item.image || null),
                    duration,
                    artist: {
                        id: artistId,
                        name: artistName,
                        url: artistUrl
                    },
                    album: {
                        id: albumId,
                        name: albumName,
                        url: albumUrl
                    }
                }
            } catch (err) {
                console.log(`Error processing song item`)
                return null
            }
        })
    )

    const validItems = items.filter((item): item is SearchSong => item !== null)

    if (validItems.length === 0) {
        throw createError('No songs found for the given search query', 404, 'NoSongsError')
    }

    songs.push(...validItems)
    return songs
}

