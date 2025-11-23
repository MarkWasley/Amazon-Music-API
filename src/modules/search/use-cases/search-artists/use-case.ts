import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { ARTIST_NEXT_TOKENS } from '../../../../common/constants/nextPageTokens.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase, SearchArgs } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { createSearchArtistPagePayload, createSearchArtistPayload } from '../../helpers/search-artist.helper.js'
import { SearchArtist } from '../../models/search-artist.model.js'

export class SearchArtistsUseCase implements IUseCase<SearchArgs, SearchArtist[]> {
    constructor() {}

    async execute({ query, page = 1 }: SearchArgs): Promise<SearchArtist[]> {
        try {
            let nextToken = null

            if (page >= 2 && page <= 25) {
                nextToken = ARTIST_NEXT_TOKENS[page]
            }

            const result = await useFetch<any>({
                url: ENDPOINTS.ARTIST_SEARCH,
                body: {
                    keyword: query,
                    ...(nextToken && { next: nextToken }),
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/search/${encodeURIComponent(query)}/artists`
            })

            const { responseData: resp } = result;

            if (!resp) {
                throw createError('No data in artists search response', 404, 'NotDataFound')
            }

            let res: SearchArtist[]

            if (page >= 2 && page <= 25) {
                res = createSearchArtistPagePayload(resp)
            } else {
                res = createSearchArtistPayload(resp)
            }

            return res;
        } catch (error) {
            throw error
        }
    }
}
