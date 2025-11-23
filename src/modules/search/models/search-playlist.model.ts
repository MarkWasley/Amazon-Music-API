import z from "zod";

export const SearchPlaylistModel = z.object({
    id: z.string(),
    name: z.string(),
    url: z.url().nullable(),
    image: z.url().nullable(),
    createdBy: z.string(),
});

export type SearchPlaylist = z.infer<typeof SearchPlaylistModel>;