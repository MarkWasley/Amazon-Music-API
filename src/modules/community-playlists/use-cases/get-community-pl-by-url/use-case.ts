import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { extractUrl } from '../../../../utils/urlExtractor.js'
import { createCommunityPlaylistPayload } from '../../helpers/community-pl.helper.js'
import { DetailsCommunityPlaylist } from '../../models/community-pl.model.js'

export class GetCommunityPlaylistByUrlUseCase implements IUseCase<string, DetailsCommunityPlaylist> {
    constructor() {}

    async execute(url: string): Promise<DetailsCommunityPlaylist> {
        try {
            const data = extractUrl(url)

            if (data === null || !data.id) {
                throw createError('Invalid community playlist URL', 400, 'BadRequest')
            }

            const result = await useFetch<any>({
                url: ENDPOINTS.COMMUNITY_PLAYLIST_INFO,
                body: {
                    id: data.id,
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/user-playlists/${encodeURIComponent(data.id)}`
            })

            const { responseData: resp, config } = result

            if (!resp) {
                throw createError('No data in album details response', 404, 'NoDataFound')
            }

            return createCommunityPlaylistPayload(resp, data.id)
        } catch (error) {
            throw error
        }
    }
}
