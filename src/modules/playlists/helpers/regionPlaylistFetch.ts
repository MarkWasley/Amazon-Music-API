// Multi-region playlist fetcher. Tries the hinted regional endpoint first (from URL domain),
// then falls back to concurrent fetching from all 3 skill endpoints (NA, EU, FE) via Promise.any.
// Fetches per-domain config.json for auth (csrf, accessToken, sessionId) since each domain
// returns different credentials.

import axios from 'axios'
import { RegionConfig, REGION_CONFIG_MAP, getRegionConfig } from '../../../common/constants/regionConfig.js'
import { DEFAULT_HEADERS, buildAmazonHeaders } from '../../../common/constants/defaultHeaders.js'
import { getRandomUserAgent } from '../../../common/constants/userAgents.js'
import { createError } from '../../../utils/createError.js'

// All domains for concurrent fallback — each territory has its own musicTerritory/marketplace
// so a playlist available in IN might not be found via UK credentials even though both use EU endpoint
const ALL_DOMAINS: { domain: string; config: RegionConfig }[] = Object.entries(REGION_CONFIG_MAP).map(
    ([domain, config]) => ({ domain, config })
)

// Per-domain config cache: stores fetched config.json with a TTL
const CONFIG_CACHE = new Map<string, { data: Record<string, unknown>; fetchedAt: number }>()
const CONFIG_TTL_MS = 5 * 60 * 1000 // 5 minutes

/** Fetch config.json from a specific Amazon Music domain, with caching */
async function fetchDomainConfig(domain: string): Promise<Record<string, unknown>> {
    const now = Date.now()
    const cached = CONFIG_CACHE.get(domain)
    if (cached && now - cached.fetchedAt < CONFIG_TTL_MS) {
        return cached.data
    }

    const configUrl = `https://${domain}/config.json`
    const response = await axios.get(configUrl, {
        headers: {
            accept: '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'user-agent': getRandomUserAgent(),
            referer: `https://${domain}/`,
            'sec-ch-ua': '"Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin'
        },
        timeout: 5000
    })

    if (response.status !== 200 || !response.data) {
        throw new Error(`Failed to fetch config from ${domain}: HTTP ${response.status}`)
    }

    const data = response.data as Record<string, unknown>
    CONFIG_CACHE.set(domain, { data, fetchedAt: now })
    return data
}

interface RegionFetchResult {
    responseData: Record<string, unknown>
    domain: string
}

/** Quick check if the Amazon response indicates an error / unavailable playlist */
function isErrorResponse(data: Record<string, unknown>): boolean {
    if ('onError' in data) return true

    const methods = data.methods as Array<Record<string, unknown>> | undefined
    if (!methods || methods.length === 0) return true

    const firstMethod = methods[0]
    const template = firstMethod?.template as Record<string, unknown> | undefined

    const widgets = template?.widgets as unknown[] | undefined
    if (Array.isArray(widgets) && widgets.length === 0) return true

    const templateData = template?.templateData as Record<string, unknown> | undefined
    if (templateData?.deeplink === '/') return true

    // Check for "playlist is no longer available" notification in second method
    if (methods.length > 1) {
        const secondMethod = methods[1] as Record<string, unknown>
        const notification = secondMethod?.notification as Record<string, unknown> | undefined
        const message = notification?.message as Record<string, unknown> | undefined
        const text = (message?.text as string) || (message?.innerHTML as string) || ''
        if (text.toLowerCase().includes('playlist is no longer available')) return true
    }

    return false
}

/** Fetch a playlist from a single regional skill endpoint using domain-specific config */
async function fetchFromEndpoint(
    playlistId: string,
    regionCfg: RegionConfig,
    domain: string
): Promise<Record<string, unknown>> {
    // Fetch config.json from the target domain (each domain has its own csrf/sessionId/deviceId)
    const domainConfig = await fetchDomainConfig(domain)

    const url = `${regionCfg.skillEndpoint}/api/showCatalogPlaylist`

    // Build inner x-amzn-* headers from domain-specific config, then override region-specific fields
    const innerHeaders = buildAmazonHeaders(
        domainConfig,
        `https://${domain}/playlists/${encodeURIComponent(playlistId)}`
    )
    innerHeaders['x-amzn-device-language'] = regionCfg.language
    innerHeaders['x-amzn-currency-of-preference'] = regionCfg.currency
    innerHeaders['x-amzn-device-family'] = regionCfg.deviceFamily
    innerHeaders['x-amzn-music-domain'] = domain
    innerHeaders['x-amzn-referer'] = domain
    innerHeaders['x-amzn-feature-flags'] = regionCfg.featureFlags

    const requestBody = {
        id: playlistId,
        userHash: JSON.stringify({ level: 'LIBRARY_MEMBER' }),
        headers: JSON.stringify(innerHeaders)
    }

    // Outer HTTP headers — override authority/origin/referer for the target region
    const outerHeaders = {
        ...DEFAULT_HEADERS,
        authority: new URL(regionCfg.skillEndpoint).host,
        origin: `https://${domain}`,
        referer: `https://${domain}/`,
        'user-agent': getRandomUserAgent()
    }

    const response = await axios.post(url, requestBody, {
        headers: outerHeaders,
        timeout: 8000
    })

    if (response.status !== 200 || !response.data) {
        throw new Error(`HTTP ${response.status}`)
    }

    return response.data as Record<string, unknown>
}

/**
 * Fetch a playlist with automatic multi-region resolution.
 *
 * - If `domainHint` is provided (extracted from a URL), tries that region's endpoint first.
 * - If the hint fails or no hint is given, concurrently fetches from all 3 skill endpoints
 *   (NA, EU, FE) and returns the first valid response via Promise.any.
 */
export async function fetchPlaylistMultiRegion(playlistId: string, domainHint?: string): Promise<RegionFetchResult> {
    // If we have a domain hint, try the targeted endpoint first
    if (domainHint) {
        const regionCfg = getRegionConfig(domainHint)
        if (regionCfg) {
            try {
                const data = await fetchFromEndpoint(playlistId, regionCfg, domainHint)
                if (!isErrorResponse(data)) {
                    return { responseData: data, domain: domainHint }
                }
            } catch {
                // Targeted fetch failed — fall through to concurrent fetch
            }
        }
    }

    // Concurrent fetch from all domains — first valid response wins
    try {
        return await Promise.any(
            ALL_DOMAINS.map(async ({ domain, config }) => {
                const data = await fetchFromEndpoint(playlistId, config, domain)
                if (isErrorResponse(data)) {
                    throw new Error(`Playlist not available on ${domain}`)
                }
                return { responseData: data, domain } satisfies RegionFetchResult
            })
        )
    } catch {
        throw createError('Playlist not found on any regional endpoint (NA, EU, FE)', 404, 'PlaylistNotFound')
    }
}
