const http = require('http')
const path = require('path')
const dbPath = path.join(__dirname, '/dbs/jamendo/favorites')
const levelup = require('levelup')
const storage = levelup(dbPath, {valueEncoding: 'json'})
const Playlist = require('./lib/playlist')
// const Playlist = require('./lib/playlist-stream')
const playlist = new Playlist(storage)
const websocket = require('websocket-stream')
const wsApp = require('./lib/websocket-handler')
// const wsApp = require('./lib/websocket-app')
const ecstatic = require('ecstatic')(path.join(__dirname, 'static'))
const app = http.createServer(ecstatic)
const port = process.env.PORT || 9999

websocket.createServer({server: app},
  s => s.pipe(wsApp({playlist: playlist})).pipe(s)
)
module.parent ||
  app.listen(port, () => console.log('server start to listen on port "%s"', port))
module.exports = app
