import { GetSongByIdUseCase } from '../use-cases/get-song-by-id/use-case.js'
import { GetSongByUrlUseCase } from '../use-cases/get-song-by-url/use-case.js'

export class SongService {
    private readonly getSongByIdUseCase: GetSongByIdUseCase
    private readonly getSongByUrlUseCase: GetSongByUrlUseCase

    constructor() {
        this.getSongByIdUseCase = new GetSongByIdUseCase()
        this.getSongByUrlUseCase = new GetSongByUrlUseCase()
    }

    async getSongById(id: string) {
        return this.getSongByIdUseCase.execute(id)
    }

    async getSongByUrl(url: string) {
        return this.getSongByUrlUseCase.execute(url)
    }
}
