import { SearchArgs } from '../../../types/index.js'
import {
    SearchAlbumsUseCase,
    SearchAllUseCase,
    SearchArtistsUseCase,
    SearchCommunityPLsUseCase,
    SearchPlaylistsUseCase,
    SearchSongsUseCase
} from '../use-cases/index.js'

export class SearchService {
    private readonly SearchAllUseCase: SearchAllUseCase
    private readonly SearchSongsUseCase: SearchSongsUseCase
    private readonly SearchAlbumsUseCase: SearchAlbumsUseCase
    private readonly SearchArtistsUseCase: SearchArtistsUseCase
    private readonly SearchPlaylistsUseCase: SearchPlaylistsUseCase
    private readonly SearchCommunityPlaylistUseCase: SearchCommunityPLsUseCase

    constructor() {
        this.SearchAllUseCase = new SearchAllUseCase()
        this.SearchSongsUseCase = new SearchSongsUseCase()
        this.SearchAlbumsUseCase = new SearchAlbumsUseCase()
        this.SearchArtistsUseCase = new SearchArtistsUseCase()
        this.SearchPlaylistsUseCase = new SearchPlaylistsUseCase()
        this.SearchCommunityPlaylistUseCase = new SearchCommunityPLsUseCase()
    }

    searchAll = (query: string) => {
        return this.SearchAllUseCase.execute(query)
    }

    searchSongs = (args: SearchArgs) => {
        return this.SearchSongsUseCase.execute(args)
    }

    searchAlbums = (args: SearchArgs) => {
        return this.SearchAlbumsUseCase.execute(args)
    }

    searchArtists = (args: SearchArgs) => {
        return this.SearchArtistsUseCase.execute(args)
    }

    searchPlaylists = (args: SearchArgs) => {
        return this.SearchPlaylistsUseCase.execute(args)
    }

    searchCommunityPlaylists = (args: SearchArgs) => {
        return this.SearchCommunityPlaylistUseCase.execute(args)
    }
}
