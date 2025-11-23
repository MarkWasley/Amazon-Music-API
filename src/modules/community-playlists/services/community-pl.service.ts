import { GetCommunityPlaylistByIdUseCase, GetCommunityPlaylistByUrlUseCase } from '../use-cases/index.js'

export class CommunityPlaylistService {
    private readonly getPlaylistByIdUseCase: GetCommunityPlaylistByIdUseCase
    private readonly getPlaylistByUrlUseCase: GetCommunityPlaylistByUrlUseCase

    constructor() {
        this.getPlaylistByIdUseCase = new GetCommunityPlaylistByIdUseCase()
        this.getPlaylistByUrlUseCase = new GetCommunityPlaylistByUrlUseCase()
    }

    async getCommunityPlaylistById(id: string) {
        return this.getPlaylistByIdUseCase.execute(id)
    }

    async getCommunityPlaylistByUrl(url: string) {
        return this.getPlaylistByUrlUseCase.execute(url)
    }
}
