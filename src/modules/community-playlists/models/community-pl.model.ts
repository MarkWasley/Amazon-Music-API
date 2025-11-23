import z from "zod";
import { SongModel } from "../../songs/models/song.model.js";


export const CommunityPlaylistModel = z.object({
    id: z.string(),
    name: z.string(),
    url: z.url(),
    image: z.url().nullable(),
    totalSongs: z.number().nullable(),
    totalDuration: z.number().nullable(),
    createdBy: z.string(),
    songs: z.array(SongModel)
})

export type DetailsCommunityPlaylist = z.infer<typeof CommunityPlaylistModel>