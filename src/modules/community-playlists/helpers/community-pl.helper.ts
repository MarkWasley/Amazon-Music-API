import { cleanImageUrl } from '../../../utils/cleanImageUrl.js'
import { createError } from '../../../utils/createError.js'
import { durationToSeconds } from '../../../utils/durationToSeconds.js'
import { DetailsSong } from '../../songs/models/song.model.js'
import { DetailsCommunityPlaylist } from '../models/community-pl.model.js'

export function isInvalidCommunityPlaylistResponse(data: any): boolean {
    try {
        const template = data?.methods?.[0]?.template
        if (!template) return false

        const isDialog =
            template.interface === 'Web.TemplatesInterface.v1_0.Touch.DialogTemplateInterface.DialogTemplate'

        const isServiceError =
            typeof template.header === 'string' && template.header.trim().toLowerCase() === 'service error'

        const hasErrorMessage =
            typeof template.body?.text === 'string' &&
            template.body.text.toLowerCase().includes('sorry something went wrong')

        return isDialog && isServiceError && hasErrorMessage
    } catch {
        return false
    }
}

export const createCommunityPlaylistPayload = (data: any, playlistId: string): DetailsCommunityPlaylist => {
    if (isInvalidCommunityPlaylistResponse(data)) {
        throw createError('Invalid or unavailable community playlist ID.', 404, 'CommunityPlaylistNotFound')
    }

    const communityPL = data.methods[0].template

    let songs: DetailsSong[] = []
    if (communityPL.widgets && communityPL.widgets.length > 0 && communityPL.widgets[0].items) {
        songs = communityPL.widgets[0].items.map((item: any) => {
            const trackId = item.id
            const artistId = item.secondaryText1Link?.deeplink?.split('/artists/')[1]?.split('/')[0] || null
            const albumId = item.secondaryText2Link?.deeplink?.split('/albums/')[1]?.split('/')[0] || null

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

    const info: DetailsCommunityPlaylist = {
        id: playlistId,
        name: communityPL.headerText.text,
        url: `https://music.amazon.com/user-playlists/${encodeURIComponent(playlistId)}`,
        image: communityPL.headerImage || null,
        totalSongs: songs.length,
        totalDuration: songs.reduce((sum, s) => sum + (s.duration || 0), 0),
        createdBy: 'Community User',
        songs
    }

    return info
}
