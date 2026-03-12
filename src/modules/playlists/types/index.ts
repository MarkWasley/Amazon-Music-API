// TypeScript types for Amazon Music playlist API responses.

export interface AmazonMethodTemplate {
    interface?: string
    header?: string
    headerText?: { text?: string }
    headerImage?: string
    headerPrimaryText?: string
    headerTertiaryText?: string
    templateData?: { deeplink?: string }
    widgets?: Array<{
        items?: Array<Record<string, unknown>>
    }>
}

export interface AmazonMethod {
    interface?: string
    template?: AmazonMethodTemplate
    notification?: {
        message?: {
            text?: string
            innerHTML?: string
        }
    }
}

export interface AmazonPlaylistSuccessResponse {
    methods: AmazonMethod[]
}

export interface AmazonErrorDetail {
    interface?: string
    message?: string
    code?: string
}

export interface AmazonPlaylistErrorResponse {
    onError?: AmazonErrorDetail
    methods?: AmazonMethod[]
}

export type AmazonPlaylistResponse = AmazonPlaylistSuccessResponse | AmazonPlaylistErrorResponse
