import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { COMMUNITY_PLAYLIST_NEXT_TOKENS } from '../../../../common/constants/nextPageTokens.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { IUseCase, SearchArgs } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { createSearchCommunityPlaylistPagePayload, createSearchCommunityPlaylistPayload } from '../../helpers/search-community-pl.helper.js'
import { SearchCommunityPl } from '../../models/search-community-pl.model.js'

export class SearchCommunityPLsUseCase implements IUseCase<SearchArgs, SearchCommunityPl[]> {
    constructor() {}

    async execute({ query, page = 1 }: SearchArgs): Promise<SearchCommunityPl[]> {
        try {
            let nextToken = null

            if (page >= 2 && page <= 25) {
                nextToken = COMMUNITY_PLAYLIST_NEXT_TOKENS[page]
            }

            const result = await useFetch<any>({
                url: ENDPOINTS.COMMUNITY_PLAYLIST_SEARCH,
                body: {
                    keyword: query,
                    ...(nextToken && { next: nextToken }),
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/search/${encodeURIComponent(query)}/communityPlaylists`
            })

            const { responseData: resp } = result

            if (!resp) {
                throw createError('No data in community playlists search response', 404, 'NotDataFound')
            }

            let res: SearchCommunityPl[]

            if (page >= 2 && page <= 25) {
                res = createSearchCommunityPlaylistPagePayload(resp)
            } else {
                res = createSearchCommunityPlaylistPayload(resp)
            }

            return res
        } catch (error) {
            throw error
        }
    }
}
