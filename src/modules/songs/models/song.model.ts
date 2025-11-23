import z from 'zod'

export const SongModel = z.object({
    id: z.string(),
    title: z.string(),
    url: z.url(),
    image: z.url().nullable(),
    duration: z.number(),
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

export type DetailsSong = z.infer<typeof SongModel>