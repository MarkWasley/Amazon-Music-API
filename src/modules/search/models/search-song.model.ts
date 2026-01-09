import z from 'zod'

export const SearchSongModel = z.object({
    id: z.string(),
    title: z.string(),
    url: z.url().nullable(),
    image: z.url().nullable(),
    duration: z.number(),
    isrc: z.string().nullable(),
    album: z.object({
        id: z.string(),
        name: z.string(),
        url: z.url().nullable()
    }),
    artist: z.object({
        id: z.string(),
        name: z.string(),
        url: z.url().nullable()
    })
})
export type SearchSong = z.infer<typeof SearchSongModel>
