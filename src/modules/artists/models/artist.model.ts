import z from "zod";
import { SongModel } from "../../songs/models/song.model.js";


export const ArtistModel = z.object({
    id: z.string(),
    name: z.string(),
    url: z.url(),
    image: z.url().nullable(),
    topSongs: z.array(SongModel)
})

export type DetailsArtist = z.infer<typeof ArtistModel>