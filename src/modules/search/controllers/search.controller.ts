import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { Routes } from '../../../types/index.js'
import { SearchService } from '../services/search.service.js'
import { SearchModel } from '../models/search-all.model.js'
import { SearchSongModel } from '../models/search-song.model.js'
import { SearchAlbumModel } from '../models/search-album.model.js'
import { SearchPlaylistModel } from '../models/search-playlist.model.js'
import { SearchArtistModel } from '../models/search-artist.model.js'
import { SearchCommunityPlModel } from '../models/search-community-pl.model.js'

export class SearchController implements Routes {
    public controller: OpenAPIHono
    private searchService: SearchService

    constructor() {
        this.controller = new OpenAPIHono({
            defaultHook: (result, c) => {
                if (!result.success) {
                    const firstError = result.error.issues[0]
                    const errorMessage = firstError
                        ? firstError.message
                        : 'Validation failed'

                    const error = {
                        message: errorMessage,
                        status: 400,
                        name: 'ZodError'
                    }
                    throw error
                }
            }
        })
        this.searchService = new SearchService()
    }

    public initRoutes() {
        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/search',
                tags: ['Search'],
                summary: 'Global search',
                description:
                    'Search for songs, albums, artists, playlists, and community playlists based on the provided query string.',
                operationId: 'globalSearch',
                request: {
                    query: z.object({
                        query: z
                            .string()
                            .min(2, { message: 'Search query must be at least 2 characters long' })
                            .openapi({
                                title: 'Search query',
                                description:
                                    'The search query string. Minimum 2 characters recommended for better results.',
                                type: 'string',
                                example: 'Imagine Dragons',
                                minLength: 2
                            })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful global search',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates whether the search was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: SearchModel.openapi({
                                        description:
                                            'Search results including songs, albums, artists,  playlists, and community playlists'
                                    })
                                })
                            }
                        }
                    },
                    400: {
                        description: 'Bad Request - Validation failed',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Validation error message',
                                        type: 'string',
                                        default: 'Validation failed'
                                    })
                                })
                            }
                        }
                    },

                    404: {
                        description: 'Not Found - No results found',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Not found',
                                        default: 'Not found'
                                    })
                                })
                            }
                        }
                    },
                    429: {
                        description: 'Too Many Requests - Rate limit exceeded',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Rate limit exceeded, please try again later',
                                        default: 'Too many requests'
                                    })
                                })
                            }
                        }
                    },
                    500: {
                        description: 'Internal Server Error',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Internal server error',
                                        default: 'Internal server error'
                                    })
                                })
                            }
                        }
                    }
                }
            }),
            async (ctx) => {
                const { query } = ctx.req.valid('query')

                const result = await this.searchService.searchAll(query)

                return ctx.json({ success: true, data: result })
            }
        )

        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/search/songs',
                tags: ['Search'],
                summary: 'Search for songs',
                description: 'Search for songs based on the provided query',
                operationId: 'searchSongs',
                request: {
                    query: z.object({
                        query: z
                            .string()
                            .min(2, { message: 'Search query must be at least 2 character long' })
                            .openapi({
                                title: 'Search query',
                                description:
                                    'Search query for songs. Minimum 2 characters recommended for better results.',
                                type: 'string',
                                example: 'Believer',
                                minLength: 2
                            }),
                        page: z.coerce
                            .number()
                            .min(1, { message: 'Page number must be at least 1' })
                            .max(25, { message: "Page number can't be more than 25" })
                            .optional()
                            .openapi({
                                title: 'Page',
                                description: 'Page number for paginated results. Each page contains 10 songs.',
                                type: 'number',
                                example: 1,
                                default: 1,
                                minimum: 1,
                                maximum: 25
                            })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful response with song search results',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates wether the search was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: z.array(SearchSongModel).openapi({
                                        description: 'Search results for songs'
                                    })
                                })
                            }
                        }
                    },
                    400: {
                        description: 'Bad Request - Validation failed',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Validation error message',
                                        type: 'string',
                                        default: 'Validation failed'
                                    })
                                })
                            }
                        }
                    },

                    404: {
                        description: 'Not Found - No results found',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Not found',
                                        default: 'Not found'
                                    })
                                })
                            }
                        }
                    },
                    429: {
                        description: 'Too Many Requests - Rate limit exceeded',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Rate limit exceeded, please try again later',
                                        default: 'Too many requests'
                                    })
                                })
                            }
                        }
                    },
                    500: {
                        description: 'Internal Server Error',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Internal server error',
                                        default: 'Internal server error'
                                    })
                                })
                            }
                        }
                    }
                }
            }),
            async (ctx) => {
                const { query, page } = ctx.req.valid('query')

                const result = await this.searchService.searchSongs({ query, page })

                return ctx.json({
                    success: true,
                    data: result
                })
            }
        )

        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/search/albums',
                tags: ['Search'],
                summary: 'Search for albums',
                description: 'Search for albums based on the provided query',
                operationId: 'searchAlbums',
                request: {
                    query: z.object({
                        query: z
                            .string()
                            .min(2, { message: 'Search query must be at least 2 character long' })
                            .openapi({
                                description:
                                    'Search query for albums. Minimum 2 characters recommended for better results.',
                                type: 'string',
                                example: 'Evolve',
                                minLength: 2
                            }),
                        page: z.coerce
                            .number()
                            .min(1, { message: 'Page number must be at least 1' })
                            .max(25, { message: "Page number can't be more than 25" })
                            .optional()
                            .openapi({
                                title: 'Page',
                                description: 'Page number for paginated results. Each page contains 10 songs.',
                                type: 'number',
                                example: 1,
                                default: 1,
                                minimum: 1,
                                maximum: 25
                            })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful response with album search results',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates whether the album search was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: z.array(SearchAlbumModel).openapi({
                                        description: 'Search results for albums'
                                    })
                                })
                            }
                        }
                    },
                    400: {
                        description: 'Bad Request - Validation failed',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Validation error message',
                                        type: 'string',
                                        default: 'Validation failed'
                                    })
                                })
                            }
                        }
                    },

                    404: {
                        description: 'Not Found - No results found',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Not found',
                                        default: 'Not found'
                                    })
                                })
                            }
                        }
                    },
                    429: {
                        description: 'Too Many Requests - Rate limit exceeded',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Rate limit exceeded, please try again later',
                                        default: 'Too many requests'
                                    })
                                })
                            }
                        }
                    },
                    500: {
                        description: 'Internal Server Error',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Internal server error',
                                        default: 'Internal server error'
                                    })
                                })
                            }
                        }
                    }
                }
            }),
            async (ctx) => {
                const { query, page } = ctx.req.valid('query')

                const result = await this.searchService.searchAlbums({ query, page })

                return ctx.json({ success: true, data: result })
            }
        )

        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/search/artists',
                tags: ['Search'],
                summary: 'Search for artists',
                description: 'Search for artists based on the provided query',
                operationId: 'searchArtists',
                request: {
                    query: z.object({
                        query: z
                            .string()
                            .min(2, { message: 'Search query must be at least 2 character long' })
                            .openapi({
                                title: 'Search query',
                                description:
                                    'Search query for artists. Minimum 2 characters recommended for better results.',
                                type: 'string',
                                example: 'Adele',
                                minLength: 2
                            }),
                        page: z.coerce
                            .number()
                            .min(1, { message: 'Page number must be at least 1' })
                            .max(25, { message: "Page number can't be more than 25" })
                            .optional()
                            .openapi({
                                title: 'Page',
                                description: 'Page number for paginated results. Each page contains 10 songs.',
                                type: 'number',
                                example: 1,
                                default: 1,
                                minimum: 1,
                                maximum: 25
                            })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful response with artist search results',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates whether the artist search was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: z.array(SearchArtistModel).openapi({
                                        description: 'Search results for artists'
                                    })
                                })
                            }
                        }
                    },
                    400: {
                        description: 'Bad Request - Validation failed',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Validation error message',
                                        type: 'string',
                                        default: 'Validation failed'
                                    })
                                })
                            }
                        }
                    },

                    404: {
                        description: 'Not Found - No results found',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Not found',
                                        default: 'Not found'
                                    })
                                })
                            }
                        }
                    },
                    429: {
                        description: 'Too Many Requests - Rate limit exceeded',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Rate limit exceeded, please try again later',
                                        default: 'Too many requests'
                                    })
                                })
                            }
                        }
                    },
                    500: {
                        description: 'Internal Server Error',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Internal server error',
                                        default: 'Internal server error'
                                    })
                                })
                            }
                        }
                    }
                }
            }),
            async (ctx) => {
                const { query, page } = ctx.req.valid('query')

                const result = await this.searchService.searchArtists({ query, page })

                return ctx.json({ success: true, data: result })
            }
        )

        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/search/playlists',
                tags: ['Search'],
                summary: 'Search for playlists',
                description: 'Search for playlists based on the provided query',
                operationId: 'searchPlaylists',
                request: {
                    query: z.object({
                        query: z
                            .string()
                            .min(2, { message: 'Search query must be at least 2 character long' })
                            .openapi({
                                title: 'Search query',
                                description:
                                    'Search query for playlists. Minimum 2 characters recommended for better results.',
                                type: 'string',
                                example: 'Indie',
                                minLength: 2
                            }),
                        page: z.coerce
                            .number()
                            .min(1, { message: 'Page number must be at least 1' })
                            .max(25, { message: "Page number can't be more than 25" })
                            .optional()
                            .openapi({
                                title: 'Page',
                                description: 'Page number for paginated results. Each page contains 10 songs.',
                                type: 'number',
                                example: 1,
                                default: 1,
                                minimum: 1,
                                maximum: 25
                            })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful response with playlist search results',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates whether the playlist search was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: z.array(SearchPlaylistModel).openapi({
                                        description: 'Search results for playlist'
                                    })
                                })
                            }
                        }
                    },
                    400: {
                        description: 'Bad Request - Validation failed',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Validation error message',
                                        type: 'string',
                                        default: 'Validation failed'
                                    })
                                })
                            }
                        }
                    },

                    404: {
                        description: 'Not Found - No results found',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Not found',
                                        default: 'Not found'
                                    })
                                })
                            }
                        }
                    },
                    429: {
                        description: 'Too Many Requests - Rate limit exceeded',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Rate limit exceeded, please try again later',
                                        default: 'Too many requests'
                                    })
                                })
                            }
                        }
                    },
                    500: {
                        description: 'Internal Server Error',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Internal server error',
                                        default: 'Internal server error'
                                    })
                                })
                            }
                        }
                    }
                }
            }),
            async (ctx) => {
                const { query, page } = ctx.req.valid('query')

                const result = await this.searchService.searchPlaylists({ query, page })

                return ctx.json({ success: true, data: result })
            }
        )

        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/search/community-playlists',
                tags: ['Search'],
                summary: 'Search for community playlists',
                description: 'Search for community playlists based on the provided query',
                operationId: 'searchCommunityPlaylists',
                request: {
                    query: z.object({
                        query: z
                            .string()
                            .min(2, { message: 'Search query must be at least 2 character long' })
                            .openapi({
                                title: 'Search query',
                                description:
                                    'Search query for community playlists. Minimum 2 characters recommended for better results.',
                                type: 'string',
                                example: 'Indie',
                                minLength: 2
                            }),
                        page: z.coerce
                            .number()
                            .min(1, { message: 'Page number must be at least 1' })
                            .max(25, { message: "Page number can't be more than 25" })
                            .optional()
                            .openapi({
                                title: 'Page',
                                description: 'Page number for paginated results. Each page contains 10 songs.',
                                type: 'number',
                                example: 1,
                                default: 1,
                                minimum: 1,
                                maximum: 25
                            })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful response with playlist search results',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates whether the playlist search was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: z.array(SearchCommunityPlModel).openapi({
                                        description: 'Search results for playlist'
                                    })
                                })
                            }
                        }
                    },
                    400: {
                        description: 'Bad Request - Validation failed',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Validation error message',
                                        type: 'string',
                                        default: 'Validation failed'
                                    })
                                })
                            }
                        }
                    },

                    404: {
                        description: 'Not Found - No results found',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Not found',
                                        default: 'Not found'
                                    })
                                })
                            }
                        }
                    },
                    429: {
                        description: 'Too Many Requests - Rate limit exceeded',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Rate limit exceeded, please try again later',
                                        default: 'Too many requests'
                                    })
                                })
                            }
                        }
                    },
                    500: {
                        description: 'Internal Server Error',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: false
                                    }),
                                    message: z.string().optional().openapi({
                                        description: 'Error message',
                                        type: 'string',
                                        example: 'Internal server error',
                                        default: 'Internal server error'
                                    })
                                })
                            }
                        }
                    }
                }
            }),
            async (ctx) => {
                const { query, page } = ctx.req.valid('query')

                const result = await this.searchService.searchCommunityPlaylists({ query, page })

                return ctx.json({ success: true, data: result })
            }
        )
    }
}
