import { Context, Next } from 'hono'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { CustomHTTPException } from '../../utils/createError.js'
import { getErrorMessage } from '../../utils/errorMessage.js'

const errorMiddleware = createMiddleware(async (c: Context, next: Next) => {
    try {
        await next()
    } catch (error: HTTPException | any) {
        console.error('Error caught in middleware:', error)
        const status = error.status || 500

        if (error instanceof CustomHTTPException) {
            return c.json(
                {
                    error: {
                        name: error.name,
                        detail: error.detail,
                        code: error.code
                    },
                    message: error.message || getErrorMessage(status),
                    success: false
                },
                status
            )
        }

        const message = error.message || getErrorMessage(status)
        return c.json(
            {
                error: {
                    name: error.name || 'InternalServerError',
                    detail: `${status}: ${message}`,
                    code: status
                },
                message: message,
                success: false
            },
            status
        )
    }
})

export default errorMiddleware
