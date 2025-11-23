import z from "zod";
import { SongModel } from "../../songs/models/song.model.js";


export const AlbumModel = z.object({
    id: z.string(),
    name: z.string(),
    url: z.url(),
    image: z.url().nullable(),
    totalSongs: z.number().nullable(),
    totalDuration: z.number().nullable(),
    releaseDate: z.string().nullable(),
    artist: z.object({
        id: z.string(),
        name: z.string(),
        url: z.url().nullable()
    }),
    songs: z.array(SongModel)
})

export type DetailsAlbum = z.infer<typeof AlbumModel>