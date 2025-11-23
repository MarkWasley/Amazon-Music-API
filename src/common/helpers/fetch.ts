import axios from 'axios'
import { FetchOptions } from '../../types/index.js'
import { ENDPOINTS, DEFAULT_HEADERS, buildAmazonHeaders } from '../constants/index.js'
import { createError } from '../../utils/createError.js'

export const useFetch = async <T>({ url, body, pageUrl = '' }: FetchOptions): Promise<T> => {
    const uri = new URL(url)

    const config = await fetchConfig()

    const httpHeaders = buildAmazonHeaders(config, pageUrl)

    const requestBody = body ? {
        ...body,
        headers: JSON.stringify(httpHeaders)
    } : {
        headers: JSON.stringify(httpHeaders)
    }

    const response = await axios.post(uri.toString(), requestBody, {
        headers: DEFAULT_HEADERS,
        timeout: 5000
    })

    if (response.status !== 200) {
        const errorMessage = response.data?.message || 'Unknown error occurred'
        throw createError(`Failed to fetch data: ${errorMessage}`, response.status as any, 'FetchError')
    }

    return { success: true, status: response.status, body: requestBody,  responseData: response.data, config: config } as unknown as T
}

export const fetchConfig = async <T>() => {
    const response = await axios.get<T>(ENDPOINTS.CONFIG, {
        headers: DEFAULT_HEADERS,
        timeout: 3000
    })

    if (response.status !== 200) {
        throw createError(`Failed to fetch config`, response.status as any, 'FetchError')
    }

    return response.data as T
}