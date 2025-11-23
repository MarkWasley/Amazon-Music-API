import { App } from './app.js'
import { AlbumController } from './modules/albums/controllers/album.controller.js'
import { ArtistController } from './modules/artists/controllers/artist.controller.js'
import { CommunityPlaylistController } from './modules/community-playlists/controllers/community-pl.controller.js'
import { PlaylistController } from './modules/playlists/controllers/playlist.controller.js'
import { SearchController } from './modules/search/controllers/search.controller.js'
import { SongController } from './modules/songs/controllers/song.controller.js'

const app = new App([
    new SearchController(),
    new SongController(),
    new AlbumController(),
    new ArtistController(),
    new PlaylistController(),
    new CommunityPlaylistController()
]).getApp()

export default app
