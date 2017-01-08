var doc = require('global/document')
var loc = require('global/window').location
var Jamendo = require('jamendo-client')
var clientId = require('../client_id').client_id
var uri = [loc.protocol.replace('http', 'ws'), '//', loc.host].join('')
var websocket = require('websocket-stream')
var socket = websocket(uri)
var Model = require('./model')

var model = new Model(
  new Jamendo(clientId, {https: true}),
  socket
, {
  player: {
    track: null,
    currentPlaylistName: null
  },
  search: {
    key: 'name',
    val: null
  },
  playlists: {
    search: {
      track: null,
      tracks: [],
      title: null
    },
    favorites: {
      track: null,
      tracks: [],
      title: 'Favorites'
    }
  },
  notify: {
    message: null,
    data: null
  }
})

var app = require('yo-yo-model')
var Player = require('./components/player')
var SearchForm = require('./components/search-form')
var Playlist = require('./components/playlist')
var Notify = require('./components/notify')

var create = (state, model) => app.html `
    <main>
        ${Player(state.player, model)}
        ${SearchForm(state.search, model)}
        <div class="rows is-top is-space-around is-wrap">
            ${Playlist(state.playlists.search, model, 'search')}
            ${Playlist(state.playlists.favorites, model, 'favorites')}
        </div>
        ${Notify(state.notify, model)}
    </main>
`

socket.once('connect', () => model.getAllTracks())

model.errors.subscribe(err => {
  console.error(err)
  setTimeout(() => model.removeNotify(), 10000)
  model.pushNotify({
    message: String(err),
    data: err.data || null
  })
})

doc.body.appendChild(app(create, model))
