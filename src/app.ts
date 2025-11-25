import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import type { Routes } from './types/index.js'
import type { HTTPException } from 'hono/http-exception'
import errorMiddleware from './common/middlewares/error.middleware.js'
import { CustomHTTPException } from './utils/createError.js'
import { getErrorMessage } from './utils/errorMessage.js'

export class App {
    private app: OpenAPIHono

    constructor(routes: Routes[]) {
        this.app = new OpenAPIHono()

        this.initGlobalMiddlewares()
        this.initRoutes(routes)
        this.initSwaggerUI()
        this.initRouteFallback()
        this.initErrorHandler()
    }

    private initRoutes(routes: Routes[]) {
        routes.forEach((route) => {
            route.initRoutes()
            this.app.route('/api', route.controller)
        })

        // Root route redirect to Swagger /docs UI
        this.app.get('/', (c) => {
            return c.redirect('/docs', 302)
        })
    }

    private initGlobalMiddlewares() {
        this.app.use(errorMiddleware)
        this.app.use(logger())
        this.app.use(prettyJSON())
        this.app.use(cors())
    }

    private initSwaggerUI() {
        this.app.doc31('/swagger', (c) => {
            const { protocol: urlProtocol, hostname, port } = new URL(c.req.url)

            const protocol = c.req.header('x-forwarded-proto') ? `${c.req.header('x-forwarded-proto')}:` : urlProtocol

            return {
                openapi: '3.1.0',

                info: {
                    version: '1.0.0',
                    title: 'Unofficial Amazon Music API',
                    description: `# Introduction
                    \nUnofficial Amazon Music API, is an unofficial API that provides programmatic access to music metadata (songs, albums, artists, playlists, community playlists) sourced from Amazon Music. it offers a simple adapter layer to expose Amazon Music data with the existing API contracts. \n`
                },
                servers: [
                    { url: `${protocol}//${hostname}${port ? `:${port}` : ''}`, description: 'Current environment' }
                ]
            }
        })

        this.app.get(
            '/docs',
            Scalar({
                pageTitle: 'Amazon Music Documentation',
                theme: 'deepSpace',
                isEditable: false,
                layout: 'modern',
                darkMode: true,
                metaData: {
                    applicationName: 'Amazon Music API',
                    author: 'NOT DELTA',
                    creator: 'NOT DELTA',
                    publisher: 'NOT DELTA',
                    robots: 'index, follow',
                    description:
                        'Amazon Music API is an unofficial wrapper written in TypeScript that adapts music.amazon.com metadata into the existing API schema for songs, albums, artists, playlists, and community playlists.'
                },
                url: '/swagger'
            })
        )
    }

    private initRouteFallback() {
        this.app.notFound((ctx) => {
            return ctx.json(
                {
                    success: false,
                    message: 'Route not found, check docs at /docs'
                },
                404
            )
        })
    }

    private initErrorHandler() {
        this.app.onError((err, ctx) => {
            const error = err as HTTPException | CustomHTTPException
            if (error instanceof CustomHTTPException) {
                return ctx.json(
                    {
                        error: {
                            name: error.name,
                            detail: error.detail,
                            code: error.code
                        },
                        message: error.message,
                        success: false
                    },
                    error.status
                )
            }

            const message = error.message || getErrorMessage(error.status)
            return ctx.json(
                {
                    error: {
                        name: error.name || 'InternalServerError',
                        detail: `${error.status}: ${message}`,
                        code: error.status
                    },
                    message: message,
                    success: false
                },
                error.status || 500
            )
        })
    }

    public getApp() {
        return this.app
    }
}
