import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { extractUrl } from '../../../../utils/urlExtractor.js'
import { createSongPayload } from '../../helpers/song.helper.js'
import { DetailsSong } from '../../models/song.model.js'

export class GetSongByUrlUseCase implements IUseCase<string, DetailsSong> {
    constructor() {}

    async execute(url: string): Promise<DetailsSong> {
        try {
            const data = extractUrl(url)

            if (data === null || !data.id) {
                throw createError('Invalid track URL', 400, 'BadRequest')
            }

            const result = await useFetch<any>({
                url: ENDPOINTS.TRACK_INFO,
                body: {
                    id: data.id,
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/tracks/${encodeURIComponent(data.id)}`
            })

            const { responseData: resp, config } = result

            if (!resp) {
                throw createError('No data in song detail response', 404, 'NoDataFound')
            }

            return createSongPayload(resp, data.id)
        } catch (error) {
            throw error
        }
    }
}
