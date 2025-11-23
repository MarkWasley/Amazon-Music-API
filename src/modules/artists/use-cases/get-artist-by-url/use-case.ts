import { ENDPOINTS } from '../../../../common/constants/endpoints.js';
import { useFetch } from '../../../../common/helpers/fetch.js';
import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js';
import { extractUrl } from '../../../../utils/urlExtractor.js'
import { createArtistPayload } from '../../helpers/artist.helper.js';
import { DetailsArtist } from '../../models/artist.model.js'

export class GetArtistByUrlUseCase implements IUseCase<string, DetailsArtist> {
    constructor() {}

    async execute(url: string) {
        try {
            const data = extractUrl(url);

            if (data === null || !data.id) {
                throw createError('Invalid artist URL', 400, 'BadRequest')
            }

            const result = await useFetch<any>({
                url: ENDPOINTS.ARTIST_INFO,
                body: {
                    id: data.id,
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/artists/${encodeURIComponent(data.id)}`
            })

            const { responseData: resp, config } = result

            if (!resp) {
                throw createError('No data in artist details response', 404, 'NoDataFound')
            }

            return await createArtistPayload(resp, config, data.id)
        } catch (error) {
            throw error
        }
    }
}
