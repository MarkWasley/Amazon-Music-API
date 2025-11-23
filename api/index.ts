import { handle } from '@hono/node-server/vercel'
import app from '../src/server.js'
import { serve } from '@hono/node-server'

export const config = {
    api: {
        bodyParser: false
    }
}

export default handle(app)

if (!process.env.VERCEL) {
    const port = process.env.PORT || 3000
    serve(
        {
            fetch: app.fetch,
            port: Number(port)
        },
        (info) => {
            console.log(`Server running at http://localhost:${info.port}`)
        }
    )
}
