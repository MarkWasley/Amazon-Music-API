import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { createAlbumPayload } from '../../helpers/album.helper.js'
import { DetailsAlbum } from '../../models/album.model.js'

export class GetAlbumByIdUseCase implements IUseCase<string, DetailsAlbum> {
    constructor() {}

    async execute(id: string): Promise<DetailsAlbum> {
        try {
            const result = await useFetch<any>({
                url: ENDPOINTS.ALBUM_INFO,
                body: {
                    id: id,
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/albums/${encodeURIComponent(id)}`
            })

            const { responseData: resp, config } = result

            if (!resp) {
                throw createError('No data in album details response', 404, 'NoDataFound')
            }

            return createAlbumPayload(resp, id)
        } catch (error) {
            throw error
        }
    }
}
