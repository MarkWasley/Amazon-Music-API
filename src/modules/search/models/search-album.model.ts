import z from "zod";


export const SearchAlbumModel = z.object({
    id: z.string(),
    name: z.string(),
    url: z.url().nullable(),
    image: z.url().nullable(),
    artist: z.object({
        id: z.string(),
        name: z.string(),
        url: z.url().nullable(),
    }),
});

export type SearchAlbum = z.infer<typeof SearchAlbumModel>;