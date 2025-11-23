import { ENDPOINTS } from "../../../../common/constants/endpoints.js";
import { PLAYLIST_NEXT_TOKENS } from "../../../../common/constants/nextPageTokens.js";
import { useFetch } from "../../../../common/helpers/fetch.js";
import { IUseCase, SearchArgs } from "../../../../types/index.js";
import { createError } from "../../../../utils/createError.js";
import { createSearchPlaylistPagePayload, createSearchPlaylistPayload } from "../../helpers/search-playlist.helper.js";
import { SearchPlaylist } from "../../models/search-playlist.model.js";


export class SearchPlaylistsUseCase implements IUseCase<SearchArgs, SearchPlaylist[]> {
    constructor() {}

    async execute ({ query, page = 1 }: SearchArgs): Promise<SearchPlaylist[]> {
        try {
            let nextToken = null;

            if (page >= 2 && page <= 25) {
                nextToken = PLAYLIST_NEXT_TOKENS[page]
            }

            const result = await useFetch<any>({
                url: ENDPOINTS.PLAYLIST_SEARCH,
                body: {
                    keyword: query,
                    ...(nextToken && { next: nextToken }),
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: `https://music.amazon.com/search/${encodeURIComponent(query)}/playlists`
            })

            const { responseData: resp } = result;

            if (!resp) {
                throw createError('No data in playlists search response', 404, 'NotDataFound')
            }

            let res: SearchPlaylist[]

            if (page >= 2 && page <= 25) {
                res = createSearchPlaylistPagePayload(resp)
            } else {
                res = createSearchPlaylistPayload(resp)
            }

            return res;
        } catch (error) {
            throw error;
        }
    }
}