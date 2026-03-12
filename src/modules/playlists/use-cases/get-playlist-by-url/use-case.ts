import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { extractUrl } from '../../../../utils/urlExtractor.js'
import { getRegionConfig } from '../../../../common/constants/regionConfig.js'
import { createPlaylistPayload } from '../../helpers/playlist.helper.js'
import { fetchPlaylistMultiRegion } from '../../helpers/regionPlaylistFetch.js'
import { DetailsPlaylist } from '../../models/playlist.model.js'

export class GetPlaylistByUrlUseCase implements IUseCase<string, DetailsPlaylist> {
    constructor() {}

    async execute(url: string): Promise<DetailsPlaylist> {
        const data = extractUrl(url)

        if (data === null || !data.id) {
            throw createError('Invalid playlist URL', 400, 'BadRequest')
        }

        // Extract domain from the URL to determine the correct regional endpoint
        let domainHint: string | undefined
        try {
            const hostname = new URL(url).hostname
            if (getRegionConfig(hostname)) {
                domainHint = hostname
            }
        } catch {
            // URL parsing failed — proceed without a hint
        }

        // If domain hint found, try that region first; otherwise concurrent fetch all 3
        const { responseData } = await fetchPlaylistMultiRegion(data.id, domainHint)
        return createPlaylistPayload(responseData, data.id)
    }
}
