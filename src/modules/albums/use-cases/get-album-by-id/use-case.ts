import { IUseCase } from '../../../../types/index.js'
import { createAlbumPayload } from '../../helpers/album.helper.js'
import { fetchAlbumMultiRegion } from '../../helpers/regionAlbumFetch.js'
import { DetailsAlbum } from '../../models/album.model.js'

export class GetAlbumByIdUseCase implements IUseCase<string, DetailsAlbum> {
    constructor() {}

    async execute(id: string): Promise<DetailsAlbum> {
        // No domain hint — concurrently try all regional endpoints
        const { responseData } = await fetchAlbumMultiRegion(id)
        return createAlbumPayload(responseData, id)
    }
}
