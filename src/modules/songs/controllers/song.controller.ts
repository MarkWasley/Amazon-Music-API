import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { Routes } from '../../../types/index.js'
import { SongService } from '../services/song.service.js'
import { SongModel } from '../models/song.model.js'

export class SongController implements Routes {
    public controller: OpenAPIHono
    private songService: SongService

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
        this.songService = new SongService()
    }

    public initRoutes() {
        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/songs',
                tags: ['Songs'],
                summary: 'Retrieve a song by URL',
                description: 'Retrieve a song by providing a direct URL to the song on Amazon Music.',
                operationId: 'getSongByUrl',
                request: {
                    query: z.object({
                        url: z
                            .url()
                            .regex(
                                new RegExp(
                                    '^https://music\\.amazon\\.[a-z.]+/tracks/[A-Za-z0-9]+(?:/[^/?]+)?/?(?:\\?.*)?$'
                                ),
                                'Invalid Amazon Music Track URL format'
                            )
                            .openapi({
                                title: 'Amazon Music Track URL',
                                description:
                                    'A direct URL to the track on Amazon Music, e.g., https://music.amazon.com/tracks/B079TNV7WL',
                                type: 'string',
                                example: 'https://music.amazon.com/tracks/B079TNV7WL',
                                default: 'https://music.amazon.com/tracks/B079TNV7WL',
                                pattern: '^https://music\\.amazon\\.[a-z.]+/tracks/[A-Za-z0-9]+(/)?(\\?.*)?$'
                            })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful response with song details',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: SongModel.openapi({
                                        title: 'Song Details',
                                        description: 'The detailed information of the song'
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

                const response = await this.songService.getSongByUrl(url)

                return ctx.json({ success: true, data: response }, 200)
            }
        )

        this.controller.openapi(
            createRoute({
                method: 'get',
                path: '/songs/{id}',
                tags: ['Songs'],
                summary: 'Retrieve a song by ID',
                description: 'Retrieve a song by providing a direct URL to the song on Amazon Music.',
                operationId: 'getSongById',
                request: {
                    params: z.object({
                        id: z.string().openapi({
                            param: {
                                name: 'id',
                                in: 'path'
                            },
                            title: 'Amazon Music Track ID',
                            description: 'The unique ID of the track on Amazon Music, e.g., B079TNV7WL',
                            type: 'string',
                            example: 'B079TNV7WL',
                            default: 'B079TNV7WL'
                        })
                    })
                },
                responses: {
                    200: {
                        description: 'Successful response with song details',
                        content: {
                            'application/json': {
                                schema: z.object({
                                    success: z.boolean().openapi({
                                        description: 'Indicates if the operation was successful',
                                        type: 'boolean',
                                        example: true
                                    }),
                                    data: SongModel.openapi({
                                        title: 'Song Details',
                                        description: 'The detailed information of the song'
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

                const response = await this.songService.getSongById(id)

                return ctx.json({ success: true, data: response }, 200)
            }
        )
    }
}
