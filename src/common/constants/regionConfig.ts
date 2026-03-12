// Region configuration map for Amazon Music multi-region playlist fetching.
// Maps Amazon Music domains to their regional skill endpoint, locale, and device settings.

export interface RegionConfig {
    skillEndpoint: string
    language: string
    currency: string
    deviceFamily: string
    featureFlags: string
}

export const SKILL_ENDPOINTS = {
    NA: 'https://na.web.skill.music.a2z.com',
    EU: 'https://eu.web.skill.music.a2z.com',
    FE: 'https://fe.web.skill.music.a2z.com'
} as const

export const REGION_CONFIG_MAP: Record<string, RegionConfig> = {
    'music.amazon.com': {
        skillEndpoint: SKILL_ENDPOINTS.NA,
        language: 'en_US',
        currency: 'USD',
        deviceFamily: 'WebPlayer',
        featureFlags: ''
    },
    'music.amazon.com.mx': {
        skillEndpoint: SKILL_ENDPOINTS.NA,
        language: 'es_MX',
        currency: 'MXN',
        deviceFamily: 'WebPlayer',
        featureFlags: ''
    },
    'music.amazon.com.br': {
        skillEndpoint: SKILL_ENDPOINTS.NA,
        language: 'pt_BR',
        currency: 'BRL',
        deviceFamily: 'WebPlayer',
        featureFlags: ''
    },
    'music.amazon.ca': {
        skillEndpoint: SKILL_ENDPOINTS.NA,
        language: 'en_CA',
        currency: 'CAD',
        deviceFamily: 'WebPlayer',
        featureFlags: ''
    },
    'music.amazon.co.uk': {
        skillEndpoint: SKILL_ENDPOINTS.EU,
        language: 'en_GB',
        currency: 'GBP',
        deviceFamily: 'WebPlayer',
        featureFlags: 'hd-supported,uhd-supported'
    },
    'music.amazon.de': {
        skillEndpoint: SKILL_ENDPOINTS.EU,
        language: 'de_DE',
        currency: 'EUR',
        deviceFamily: 'WebPlayer',
        featureFlags: 'hd-supported,uhd-supported'
    },
    'music.amazon.fr': {
        skillEndpoint: SKILL_ENDPOINTS.EU,
        language: 'fr_FR',
        currency: 'EUR',
        deviceFamily: 'WebPlayer',
        featureFlags: 'hd-supported,uhd-supported'
    },
    'music.amazon.it': {
        skillEndpoint: SKILL_ENDPOINTS.EU,
        language: 'it_IT',
        currency: 'EUR',
        deviceFamily: 'WebPlayer',
        featureFlags: 'hd-supported,uhd-supported'
    },
    'music.amazon.es': {
        skillEndpoint: SKILL_ENDPOINTS.EU,
        language: 'es_ES',
        currency: 'EUR',
        deviceFamily: 'WebPlayer',
        featureFlags: 'hd-supported,uhd-supported'
    },
    'music.amazon.in': {
        skillEndpoint: SKILL_ENDPOINTS.EU,
        language: 'en_IN',
        currency: 'INR',
        deviceFamily: 'WebPlayer',
        featureFlags: 'hd-supported,uhd-supported'
    },
    'music.amazon.sa': {
        skillEndpoint: SKILL_ENDPOINTS.EU,
        language: 'ar_SA',
        currency: 'SAR',
        deviceFamily: 'WebPlayer',
        featureFlags: ''
    },
    'music.amazon.ae': {
        skillEndpoint: SKILL_ENDPOINTS.EU,
        language: 'ar_AE',
        currency: 'AED',
        deviceFamily: 'WebPlayer',
        featureFlags: ''
    },
    'music.amazon.co.jp': {
        skillEndpoint: SKILL_ENDPOINTS.FE,
        language: 'ja_JP',
        currency: 'JPY',
        deviceFamily: 'WebPlayer',
        featureFlags: 'hd-supported,uhd-supported'
    },
    'music.amazon.com.au': {
        skillEndpoint: SKILL_ENDPOINTS.FE,
        language: 'en_AU',
        currency: 'AUD',
        deviceFamily: 'WebPlayer',
        featureFlags: 'hd-supported,uhd-supported'
    }
}

export function getRegionConfig(domain: string): RegionConfig | undefined {
    return REGION_CONFIG_MAP[domain]
}
