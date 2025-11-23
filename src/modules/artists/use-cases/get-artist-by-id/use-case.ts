import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { createArtistPayload } from '../../helpers/artist.helper.js'
import { DetailsArtist } from '../../models/artist.model.js'

export class GetArtistByIdUseCase implements IUseCase<string, DetailsArtist> {
    constructor() {}

    async execute(id: string): Promise<DetailsArtist> {
        try {
            const result = await useFetch<any>({
                url: ENDPOINTS.ARTIST_INFO,
                body: {
                    id: id,
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/artists/${encodeURIComponent(id)}`
            })

            const { responseData: resp, config } = result

            if (!resp) {
                throw createError('No data in artist details response', 404, 'NoDataFound')
            }

            return await createArtistPayload(resp, config, id);
        } catch (error) {
            throw error
        }
    }
}
