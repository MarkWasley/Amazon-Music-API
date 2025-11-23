import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { createSongPayload } from '../../helpers/song.helper.js'
import { DetailsSong } from '../../models/song.model.js'

export class GetSongByIdUseCase implements IUseCase<string, DetailsSong> {
    constructor() {}

    async execute(id: string): Promise<DetailsSong> {
        try {
            const result = await useFetch<any>({
                url: ENDPOINTS.TRACK_INFO,
                body: {
                    id: id,
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/tracks/${encodeURIComponent(id)}`
            })

            const { responseData: resp, config } = result

            if (!resp) {
                throw createError('No data in song details response', 404, 'NoDataFound')
            }

            return createSongPayload(resp, id)
        } catch (error) {
            throw error
        }
    }
}
