import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { createPlaylistPayload } from '../../helpers/playlist.helper.js'
import { DetailsPlaylist } from '../../models/playlist.model.js'

export class GetPlaylistByIdUseCase implements IUseCase<string, DetailsPlaylist> {
    constructor() {}

    async execute(id: string): Promise<DetailsPlaylist> {
        try {
            const result = await useFetch<any>({
                url: ENDPOINTS.PLAYLIST_INFO,
                body: {
                    id: id,
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/playlists/${encodeURIComponent(id)}`
            })

            const { responseData: resp, config } = result

            
            if (!resp) {
                throw createError('No data in album details response', 404, 'NoDataFound')
            }

            return createPlaylistPayload(resp, id);
        } catch (error) {
            throw error
        }
    }
}
