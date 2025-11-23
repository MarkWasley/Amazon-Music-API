import z from "zod";

export const SearchCommunityPlModel = z.object({
    id: z.string(),
    name: z.string(),
    url: z.url().nullable(),
    image: z.url().nullable(),
    createdBy: z.string(),
});

export type SearchCommunityPl = z.infer<typeof SearchCommunityPlModel>;