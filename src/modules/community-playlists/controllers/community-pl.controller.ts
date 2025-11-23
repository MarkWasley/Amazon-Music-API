import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { Routes } from '../../../types/index.js'
import { CommunityPlaylistService } from '../services/community-pl.service.js'
import { CommunityPlaylistModel } from '../models/community-pl.model.js'

export class CommunityPlaylistController implements Routes {
    public controller: OpenAPIHono
    private communityPlaylistService: CommunityPlaylistService

    constructor() {
        this.controller = new OpenAPIHono({
            defaultHook: (result, c) => {
                if (!result.success) {
                    const firstError = result.error.issues[0]
                    const errorMessage = firstError ? firstError.message : 'Validation failed'

                    const error = {
                        message: errorMessage,
                        status: 400,
                        name: 'ZodError'
                    }
                    throw error
                }
            }
        })
        this.communityPlaylistService = new CommunityPlaylistService()
    }

    public initRoutes() {
        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/community-playlists',
                tags: ['Community Playlist'],
                summary: 'Retrieve a community playlist by URL',
                description: 'Retrieve a community playlist by providing a direct URL to the playlist on Amazon Music.',
                operationId: 'getCommunityPlaylistByUrl',
                request: {
                    query: z.object({
                        url: z
                            .url()
                            .regex(
                                new RegExp(
                                    '^https://music\\.amazon\\.[a-z.]+/user-playlists/[a-z0-9]+/?(?:\\?.*)?$',
                                    'i'
                                ),
                                'Invalid Amazon Music Community Playlist URL format'
                            )

                            .openapi({
                                title: 'Amazon Music Playlist URL',
                                description:
                                    'A direct URL to a Amazon Music playlist using the full numeric format, e.g. https://music.amazon.com/user-playlists/a75b6df7a362487db81f31bca79eb28esune',
                                example: 'https://music.amazon.com/user-playlists/a75b6df7a362487db81f31bca79eb28esune',
                                default: 'https://music.amazon.com/user-playlists/a75b6df7a362487db81f31bca79eb28esune',
                                pattern: '^https://music\\.amazon\\.[a-z.]+/user-playlists/[A-Za-z0-9]+(/)?(\\?.*)?$'
                            })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful response with playlist details',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: CommunityPlaylistModel.openapi({
                                        title: 'Playlist Details',
                                        description: 'The detailed information of the playlist'
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
                const { url } = ctx.req.query()

                const response = await this.communityPlaylistService.getCommunityPlaylistByUrl(url)

                return ctx.json({ success: true, data: response })
            }
        )

        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/community-playlists/{id}',
                tags: ['Community Playlist'],
                summary: 'Retrieve a community playlist by ID',
                operationId: 'getCommunityPlaylistById',
                request: {
                    params: z.object({
                        id: z.string().openapi({
                            param: {
                                name: 'id',
                                in: 'path'
                            },
                            title: 'playlist ID',
                            description: 'The unique ID of the community playlist',
                            type: 'string',
                            example: 'a75b6df7a362487db81f31bca79eb28esune',
                            default: 'a75b6df7a362487db81f31bca79eb28esune'
                        })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful response with playlist details',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: CommunityPlaylistModel.openapi({
                                        title: 'playlist Details',
                                        description: 'The detailed information of the playlist'
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
                const { id } = ctx.req.param()
                const playlist = await this.communityPlaylistService.getCommunityPlaylistById(id)
                return ctx.json({ success: true, data: playlist })
            }
        )
    }
}
