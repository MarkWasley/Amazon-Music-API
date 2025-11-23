import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { ALBUM_NEXT_TOKENS } from '../../../../common/constants/nextPageTokens.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase, SearchArgs } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { createSearchAlbumPagePayload, createSearchAlbumPayload } from '../../helpers/search-albums.helper.js'
import { SearchAlbum } from '../../models/search-album.model.js'

export class SearchAlbumsUseCase implements IUseCase<SearchArgs, SearchAlbum[]> {
    constructor() {}

    async execute({ query, page = 1 }: SearchArgs): Promise<SearchAlbum[]> {
        try {
            let nextToken = null

            if (page >= 2 && page <= 25) {
                nextToken = ALBUM_NEXT_TOKENS[page]
            }

            const result = await useFetch<any>({
                url: ENDPOINTS.ALBUM_SEARCH,
                body: {
                    keyword: query,
                    ...(nextToken && { next: nextToken }),
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/search/${encodeURIComponent(query)}/albums`
            })

            const { responseData: resp } = result;

            if (!resp) {
                throw createError("No data in albums search response", 404, "NotDataFound")
            }

            let res: SearchAlbum[]

            if (page >= 2 && page <= 25) {
                res = createSearchAlbumPagePayload(resp)
            } else {
                res = createSearchAlbumPayload(resp)
            }

            return res;
        } catch (error) {
            throw error
        }
    }
}
