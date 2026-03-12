import { IUseCase } from '../../../../types/index.js'
import { createPlaylistPayload } from '../../helpers/playlist.helper.js'
import { fetchPlaylistMultiRegion } from '../../helpers/regionPlaylistFetch.js'
import { DetailsPlaylist } from '../../models/playlist.model.js'

export class GetPlaylistByIdUseCase implements IUseCase<string, DetailsPlaylist> {
    constructor() {}

    async execute(id: string): Promise<DetailsPlaylist> {
        // No domain hint — concurrently try all 3 regional endpoints (NA, EU, FE)
        const { responseData } = await fetchPlaylistMultiRegion(id)
        return createPlaylistPayload(responseData, id)
    }
}
