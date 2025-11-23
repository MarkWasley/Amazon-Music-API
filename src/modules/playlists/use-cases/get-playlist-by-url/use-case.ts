import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { extractUrl } from '../../../../utils/urlExtractor.js'
import { createPlaylistPayload } from '../../helpers/playlist.helper.js'
import { DetailsPlaylist } from '../../models/playlist.model.js'

export class GetPlaylistByUrlUseCase implements IUseCase<string, DetailsPlaylist> {
    constructor() {}

    async execute(url: string): Promise<DetailsPlaylist> {
        try {
            const data = extractUrl(url)

            if (data === null || !data.id) {
                throw createError('Invalid playlist URL', 400, 'BadRequest')
            }

            const result = await useFetch<any>({
                url: ENDPOINTS.PLAYLIST_INFO,
                body: {
                    id: data.id,
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/playlists/${encodeURIComponent(data.id)}`
            })

            const { responseData: resp, config } = result

            if (!resp) {
                throw createError('No data in album details response', 404, 'NoDataFound')
            }

            return createPlaylistPayload(resp, data.id)
        } catch (error) {
            throw error
        }
    }
}
