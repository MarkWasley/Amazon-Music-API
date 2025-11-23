import z from "zod";
import { SearchSongModel } from "./search-song.model.js";
import { SearchAlbumModel } from "./search-album.model.js";
import { SearchArtistModel } from "./search-artist.model.js";
import { SearchPlaylistModel } from "./search-playlist.model.js";
import { SearchCommunityPlModel } from "./search-community-pl.model.js";


export const SearchModel = z.object({
    songs: SearchSongModel.array(),
    albums: SearchAlbumModel.array(),
    artists: SearchArtistModel.array(),
    playlists: SearchPlaylistModel.array(),
    communityPlaylists: SearchCommunityPlModel.array().nullable(),
});

export type SearchAll = z.infer<typeof SearchModel>;