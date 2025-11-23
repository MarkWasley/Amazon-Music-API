import { IUseCase } from '../../../../types/index.js'
import { useFetch } from '../../../../common/helpers/fetch.js'
import { ENDPOINTS } from '../../../../common/constants/endpoints.js'
import { HTTPException } from 'hono/http-exception'
import { SearchAll } from '../../models/search-all.model.js'
import { createSearchAllPayload } from '../../helpers/search-all.helper.js'

export class SearchAllUseCase implements IUseCase<string, any> {
    async execute(query: string): Promise<any> {
        try {
            const res = await useFetch<any>({
                url: ENDPOINTS.GLOBAL_SEARCH,
                body: {
                    keyword: JSON.stringify({
                        interface:
                            'Web.TemplatesInterface.v1_0.Touch.SearchTemplateInterface.SearchKeywordClientInformation',
                        keyword: query
                    }),
                    userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' })
                },
                pageUrl: 'https://music.amazon.com/search'
            })

            // return res.data

            if (res.status !== 200) {
                throw new HTTPException(res.status, { message: 'Failed to fetch search results' })
            }

            // Use responseData instead of data, and pass the full res object
            const { responseData, config } = res

            if (!responseData) {
                throw new HTTPException(404, { message: 'No search results found' })
            }

            // Pass the responseData to createSearchAllPayload
            return createSearchAllPayload(config, responseData)
        } catch (error) {
            throw error
        }
    }
}
