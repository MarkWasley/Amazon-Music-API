import { IUseCase } from '../../../../types/index.js'
import { createError } from '../../../../utils/createError.js'
import { extractUrl } from '../../../../utils/urlExtractor.js'
import { getRegionConfig } from '../../../../common/constants/regionConfig.js'
import { createAlbumPayload } from '../../helpers/album.helper.js'
import { fetchAlbumMultiRegion } from '../../helpers/regionAlbumFetch.js'
import { DetailsAlbum } from '../../models/album.model.js'

export class GetAlbumByUrlUseCase implements IUseCase<string, DetailsAlbum> {
    constructor() {}

    async execute(url: string): Promise<DetailsAlbum> {
        const data = extractUrl(url)

        if (data === null || !data.id) {
            throw createError('Invalid album URL', 400, 'BadRequest')
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

        // If domain hint found, try that region first; otherwise concurrent fetch all
        const { responseData } = await fetchAlbumMultiRegion(data.id, domainHint)
        return createAlbumPayload(responseData, data.id)
    }
}
