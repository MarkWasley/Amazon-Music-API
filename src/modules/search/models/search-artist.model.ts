import z from 'zod'

export const SearchArtistModel = z.object({
    id: z.string(),
    name: z.string(),
    url: z.url().nullable(),
    image: z.url().nullable()
})

export type SearchArtist = z.infer<typeof SearchArtistModel>
