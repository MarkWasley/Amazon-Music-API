import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { TRACK_NEXT_TOKENS } from '../../../../common/constants/nextPageTokens.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase, SearchArgs } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { createSearchSongsPagePayload, createSearchSongsPayload } from '../../helpers/search-songs.helper.js'
import { SearchSong } from '../../models/search-song.model.js'

export class SearchSongsUseCase implements IUseCase<SearchArgs, SearchSong[]> {
    constructor() {}

    async execute({ query, page = 1, limit }: SearchArgs): Promise<SearchSong[]> {
        try {
            let nextToken = null

            if (page >= 2 && page <= 25) {
                nextToken = TRACK_NEXT_TOKENS[page]
            }

            const result = await useFetch<any>({
                url: ENDPOINTS.TRACKS_SEARCH,
                body: {
                    keyword: query,
                    ...(nextToken && { next: nextToken }),
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/search/${encodeURIComponent(query)}/songs`
            })

            const { responseData: resp, config } = result;

            if (!resp) {
                throw createError('No data in songs search response', 404, 'NoDataFound')
            }

            let res: SearchSong[];

            if (page >= 2 && page <= 25) {
                res = await createSearchSongsPagePayload(config, resp, limit);
            } else {
                res = await createSearchSongsPayload(config, resp, limit);
            }

            return res;
        } catch (error) {
            throw error
        }
    }
}
