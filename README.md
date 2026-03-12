# Amazon Music API

An unofficial metadata-only API for Amazon Music. This project provides REST endpoints to retrieve information about songs, albums, artists, playlists, and community playlists from Amazon Music.

## ⚠️ Disclaimer

This is an **unofficial** and **educational** project. It is not affiliated with, endorsed by, or in any way officially connected to Amazon or Amazon Music. This API **only provides metadata** and does not stream, download, or distribute any music content. Use at your own risk and ensure compliance with Amazon's Terms of Service.

## ⏱️ Important Notes on Response Times

**The following endpoints may take more than 5 seconds to respond:**

- `/api/search` - Global search across all entity types
- `/api/search/artists` - Artist search
- `/api/search/songs` - Songs search
- `/api/artists/{id}` - Artist details with top songs
- `/api/artists` (URL endpoint) - Artist details with top songs

This is due to the need to make additional API calls to retrieve track duration information, as the main Amazon Music API does not provide duration data in the initial response.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Language:** TypeScript
- **Web Framework:** [Hono](https://hono.dev)
- **API Documentation:** [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- **Validation:** [Zod](https://zod.dev)
- **HTTP Client:** Axios

## Installation

### Quick Deploy (One-Click)

Deploy to Vercel with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnotdeltaxd%2FAmazon-Music-API&project-name=amazon-music-api&repository-name=amazon-music-api)

This will automatically:

- Clone the repository
- Setup environment variables
- Deploy on Vercel
- Provide you with a live API endpoint

### Local Setup

#### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh)
- npm or bun package manager

#### Installation

```bash
# Clone the repository
git clone https://github.com/notdeltaxd/Amazon-Music-API.git
cd amazon-music-api

# Install dependencies
bun install
# or
npm install

# Start development server
bun run dev
# or
npm run dev
```

## Development

```bash
# Watch mode with hot reload
bun run dev

# Build the project
bun run build

# Start production server
bun start

# Run tests
bun run test

# View test UI
bun run test:ui

# Format code
bun run format
```

## API Endpoints

All endpoints return JSON responses with a `success` boolean and `data` field containing the results.

### Search Endpoints

#### Global Search

Search across all entity types (songs, albums, artists, playlists, community playlists).

```bash
curl 'http://localhost:3000/api/search?query=Imagine%20Dragons'
```

**Request:**

- **Method:** `GET`
- **Path:** `/search`
- **Query Parameters:**
    - `query` (string, required) - Search query (minimum 2 characters)

**Response:**

```json
{
  "success": true,
  "data": {
    "songs": [...],
    "albums": [...],
    "artists": [...],
    "playlists": [...],
    "communityPlaylists": [...]
  }
}
```

#### Search Songs

```bash
curl 'http://localhost:3000/api/search/songs?query=Believer&page=1&limit=5'
```

**Request:**

- **Method:** `GET`
- **Path:** `/search/songs`
- **Query Parameters:**
    - `query` (string, required) - Search query (minimum 2 characters)
    - `page` (number, optional) - Page number (default: 1, max: 25). Each page contains up to 10 results.
    - `limit` (number, optional) - Maximum number of songs to return (default: 10, max: 10). Only fetches album data for the limited number of tracks, optimizing response time.

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "title": "string",
            "url": null,
            "image": null,
            "duration": 1,
            "isrc": "string | null",
            "album": {
                "id": "string",
                "name": "string",
                "url": null
            },
            "artist": {
                "id": "string",
                "name": "string",
                "url": null
            }
        }
    ]
}
```

#### Search Albums

```bash
curl 'http://localhost:3000/api/search/albums?query=Evolve&page=1'
```

**Request:**

- **Method:** `GET`
- **Path:** `/search/albums`
- **Query Parameters:**
    - `query` (string, required) - Search query (minimum 2 characters)
    - `page` (number, optional) - Page number (default: 1, max: 25). Each page contains 10 results.

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "name": "string",
            "url": null,
            "image": null,
            "artist": {
                "id": "string",
                "name": "string",
                "url": null
            }
        }
    ]
}
```

#### Search Artists

```bash
curl 'http://localhost:3000/api/search/artists?query=Adele&page=1'
```

**Request:**

- **Method:** `GET`
- **Path:** `/search/artists`
- **Query Parameters:**
    - `query` (string, required) - Search query (minimum 2 characters)
    - `page` (number, optional) - Page number (default: 1, max: 25). Each page contains 10 results.

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "name": "string",
            "url": null,
            "image": null
        }
    ]
}
```

#### Search Playlists

```bash
curl 'http://localhost:3000/api/search/playlists?query=Indie&page=1'
```

**Request:**

- **Method:** `GET`
- **Path:** `/search/playlists`
- **Query Parameters:**
    - `query` (string, required) - Search query (minimum 2 characters)
    - `page` (number, optional) - Page number (default: 1, max: 25). Each page contains 10 results.

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "name": "string",
            "url": null,
            "image": null,
            "createdBy": "string"
        }
    ]
}
```

#### Search Community Playlists

```bash
curl 'http://localhost:3000/api/search/community-playlists?query=Indie&page=1'
```

**Request:**

- **Method:** `GET`
- **Path:** `/search/community-playlists`
- **Query Parameters:**
    - `query` (string, required) - Search query (minimum 2 characters)
    - `page` (number, optional) - Page number (default: 1, max: 25). Each page contains 10 results.

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "name": "string",
            "url": null,
            "image": null,
            "createdBy": "string"
        }
    ]
}
```

---

### Songs Endpoints

#### Get Song by URL

```bash
curl 'http://localhost:3000/api/songs?url=https%3A%2F%2Fmusic.amazon.com%2Ftracks%2FB079VDQRPX'
```

**Request:**

- **Method:** `GET`
- **Path:** `/songs`
- **Query Parameters:**
    - `url` (string, required) - Amazon Music track URL (e.g., `https://music.amazon.com/tracks/B079VDQRPX`)

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "string",
        "title": "string",
        "url": "https://example.com",
        "image": null,
        "duration": 1,
        "isrc": "string | null",
        "album": {
            "id": "string",
            "name": "string",
            "url": null
        },
        "artist": {
            "id": "string",
            "name": "string",
            "url": null
        }
    }
}
```

#### Get Song by ID

```bash
curl 'http://localhost:3000/api/songs/B079VDQRPX'
```

**Request:**

- **Method:** `GET`
- **Path:** `/songs/{id}`
- **Path Parameters:**
    - `id` (string, required) - Amazon Music track ID (e.g., `B079VDQRPX`)

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "string",
        "title": "string",
        "url": "https://example.com",
        "image": null,
        "duration": 1,
        "isrc": "string | null",
        "album": {
            "id": "string",
            "name": "string",
            "url": null
        },
        "artist": {
            "id": "string",
            "name": "string",
            "url": null
        }
    }
}
```

---

### Albums Endpoints

#### Get Album by URL

```bash
curl 'http://localhost:3000/api/albums?url=https%3A%2F%2Fmusic.amazon.com%2Falbums%2FB079VSDTZP'
```

**Request:**

- **Method:** `GET`
- **Path:** `/albums`
- **Query Parameters:**
    - `url` (string, required) - Amazon Music album URL (e.g., `https://music.amazon.com/albums/B079VSDTZP`)

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "string",
        "name": "string",
        "url": "https://example.com",
        "image": null,
        "totalSongs": null,
        "totalDuration": null,
        "releaseDate": null,
        "artist": {
            "id": "string",
            "name": "string",
            "url": null
        },
        "songs": [
            {
                "id": "string",
                "title": "string",
                "url": "https://example.com",
                "image": null,
                "duration": 1,
                "isrc": "string | null",
                "album": {
                    "id": "string",
                    "name": "string",
                    "url": null
                },
                "artist": {
                    "id": "string",
                    "name": "string",
                    "url": null
                }
            }
        ]
    }
}
```

#### Get Album by ID

```bash
curl 'http://localhost:3000/api/albums/B079VSDTZP'
```

**Request:**

- **Method:** `GET`
- **Path:** `/albums/{id}`
- **Path Parameters:**
    - `id` (string, required) - Amazon Music album ID (e.g., `B079VSDTZP`)

**Response:** Same as Get Album by URL

---

### Artists Endpoints

#### Get Artist by URL

```bash
curl 'http://localhost:3000/api/artists?url=https%3A%2F%2Fmusic.amazon.com%2Fartists%2FB003AM1Q94%2Fimagine-dragons'
```

**Request:**

- **Method:** `GET`
- **Path:** `/artists`
- **Query Parameters:**
    - `url` (string, required) - Amazon Music artist URL (e.g., `https://music.amazon.com/artists/B003AM1Q94/imagine-dragons`)

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "string",
        "name": "string",
        "url": "https://example.com",
        "image": null,
        "topSongs": [
            {
                "id": "string",
                "title": "string",
                "url": "https://example.com",
                "image": null,
                "duration": 1,
                "isrc": "string | null",
                "album": {
                    "id": "string",
                    "name": "string",
                    "url": null
                },
                "artist": {
                    "id": "string",
                    "name": "string",
                    "url": null
                }
            }
        ]
    }
}
```

#### Get Artist by ID

```bash
curl 'http://localhost:3000/api/artists/B003AM1Q94'
```

**Request:**

- **Method:** `GET`
- **Path:** `/artists/{id}`
- **Path Parameters:**
    - `id` (string, required) - Amazon Music artist ID (e.g., `B003AM1Q94`)

**Response:** Same as Get Artist by URL

---

### Playlists Endpoints

#### Get Playlist by URL

```bash
curl 'http://localhost:3000/api/playlists?url=https%3A%2F%2Fmusic.amazon.com%2Fplaylists%2FB07QHGBGC9'
```

**Request:**

- **Method:** `GET`
- **Path:** `/playlists`
- **Query Parameters:**
    - `url` (string, required) - Amazon Music playlist URL (e.g., `https://music.amazon.com/playlists/B07QHGBGC9`)

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "string",
        "name": "string",
        "url": "https://example.com",
        "image": null,
        "totalSongs": null,
        "totalDuration": null,
        "createdBy": "string",
        "songs": [
            {
                "id": "string",
                "title": "string",
                "url": "https://example.com",
                "image": null,
                "duration": 1,
                "isrc": "string | null",
                "album": {
                    "id": "string",
                    "name": "string",
                    "url": null
                },
                "artist": {
                    "id": "string",
                    "name": "string",
                    "url": null
                }
            }
        ]
    }
}
```

#### Get Playlist by ID

```bash
curl 'http://localhost:3000/api/playlists/B07QHGBGC9'
```

**Request:**

- **Method:** `GET`
- **Path:** `/playlists/{id}`
- **Path Parameters:**
    - `id` (string, required) - Amazon Music playlist ID (e.g., `B07QHGBGC9`)

**Response:** Same as Get Playlist by URL

---

### Community Playlists Endpoints

#### Get Community Playlist by URL

```bash
curl 'http://localhost:3000/api/community-playlists?url=https%3A%2F%2Fmusic.amazon.com%2Fuser-playlists%2Fa75b6df7a362487db81f31bca79eb28esune'
```

**Request:**

- **Method:** `GET`
- **Path:** `/community-playlists`
- **Query Parameters:**
    - `url` (string, required) - Amazon Music community playlist URL (e.g., `https://music.amazon.com/user-playlists/a75b6df7a362487db81f31bca79eb28esune`)

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "string",
        "name": "string",
        "url": "https://example.com",
        "image": null,
        "totalSongs": null,
        "totalDuration": null,
        "createdBy": "string",
        "songs": [
            {
                "id": "string",
                "title": "string",
                "url": "https://example.com",
                "image": null,
                "duration": 1,
                "isrc": "string | null",
                "album": {
                    "id": "string",
                    "name": "string",
                    "url": null
                },
                "artist": {
                    "id": "string",
                    "name": "string",
                    "url": null
                }
            }
        ]
    }
}
```

#### Get Community Playlist by ID

```bash
curl 'http://localhost:3000/api/community-playlists/a75b6df7a362487db81f31bca79eb28esune'
```

**Request:**

- **Method:** `GET`
- **Path:** `/community-playlists/{id}`
- **Path Parameters:**
    - `id` (string, required) - Amazon Music community playlist ID (e.g., `a75b6df7a362487db81f31bca79eb28esune`)

**Response:** Same as Get Community Playlist by URL

---

## Error Handling

All endpoints return standardized error responses:

**400 - Bad Request** (Validation Error)

```json
{
    "success": false,
    "message": "Validation failed"
}
```

**404 - Not Found**

```json
{
    "success": false,
    "message": "Not found"
}
```

**429 - Rate Limited**

```json
{
    "success": false,
    "message": "Rate limit exceeded, please try again later"
}
```

**500 - Internal Server Error**

```json
{
    "success": false,
    "message": "Internal server error"
}
```

## Interactive API Documentation

Once the server is running, access the interactive Swagger UI at:

```
http://localhost:3000
```

This provides interactive documentation for all endpoints with request/response schemas, examples, and the ability to test requests directly.

## Rate Limiting

Amazon Music may rate limit requests. Please be respectful with request frequency and implement appropriate delays in your applications.

## Multi-Region Support

Playlist and album endpoints support automatic multi-region resolution. Amazon Music content is territory-specific, so a playlist or album from Japan may not be accessible through the US endpoint.

### How It Works

- **By URL:** The domain is extracted from the URL (e.g., `music.amazon.co.jp`) and the matching regional endpoint is tried first. If it fails, all other regions are tried concurrently.
- **By ID:** All supported regional domains are tried concurrently via `Promise.any`, and the first successful response is returned.

Each region has its own `config.json` (csrf tokens, session credentials), which is fetched and cached per-domain automatically.

### Supported Endpoints

Multi-region resolution is enabled for:

- **Playlists** — `/api/playlists/{id}` and `/api/playlists?url=`
- **Albums** — `/api/albums/{id}` and `/api/albums?url=`

### Supported Regions

| Domain                | Region | Endpoint                     | Territory |
| --------------------- | ------ | ---------------------------- | --------- |
| `music.amazon.com`    | NA     | `na.web.skill.music.a2z.com` | US        |
| `music.amazon.ca`     | NA     | `na.web.skill.music.a2z.com` | CA        |
| `music.amazon.com.mx` | NA     | `na.web.skill.music.a2z.com` | MX        |
| `music.amazon.com.br` | NA     | `na.web.skill.music.a2z.com` | BR        |
| `music.amazon.co.uk`  | EU     | `eu.web.skill.music.a2z.com` | GB        |
| `music.amazon.de`     | EU     | `eu.web.skill.music.a2z.com` | DE        |
| `music.amazon.fr`     | EU     | `eu.web.skill.music.a2z.com` | FR        |
| `music.amazon.it`     | EU     | `eu.web.skill.music.a2z.com` | IT        |
| `music.amazon.es`     | EU     | `eu.web.skill.music.a2z.com` | ES        |
| `music.amazon.in`     | EU     | `eu.web.skill.music.a2z.com` | IN        |
| `music.amazon.co.jp`  | FE     | `fe.web.skill.music.a2z.com` | JP        |
| `music.amazon.com.au` | FE     | `fe.web.skill.music.a2z.com` | AU        |

### Examples

```bash
# Fetch a US playlist by URL — hits NA endpoint directly
curl 'http://localhost:3000/api/playlists?url=https%3A%2F%2Fmusic.amazon.com%2Fplaylists%2FB07QHGBGC9'

# Fetch an India playlist by URL — hits EU endpoint (music.amazon.in)
curl 'http://localhost:3000/api/playlists?url=https%3A%2F%2Fmusic.amazon.in%2Fplaylists%2FB0FY37PDGM'

# Fetch by ID only — tries all regions concurrently
curl 'http://localhost:3000/api/playlists/B0FY37PDGM'

# Fetch a Japanese album by URL — hits FE endpoint (music.amazon.co.jp)
curl 'http://localhost:3000/api/albums?url=https%3A%2F%2Fmusic.amazon.co.jp%2Falbums%2FB06XJ23RLF'

# Fetch album by ID — tries all regions concurrently
curl 'http://localhost:3000/api/albums/B06XJ23RLF'
```

## Limitations

- **Metadata Only** - This API provides metadata only. It does not stream, download, or distribute music.
- **Unofficial** - This is not an official Amazon product and is subject to changes in Amazon's API.
- **Duration Data** - Track duration requires additional API calls, increasing response times.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to help improve this project.
