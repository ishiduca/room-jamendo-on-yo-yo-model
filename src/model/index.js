var inherits = require('inherits')
var xtend = require('xtend')
var through = require('through2')
var Model = require('yo-yo-model/model')

inherits(Playlist, Model)
module.exports = Playlist

function Playlist (jamendo, socket, initialState) {
  Model.call(this, initialState)
  this.jamendo = jamendo
  this.socket = socket

  this.socket.once('connect', () => console.log('websocket connected'))
  this.socket.once('error', err => this.errors.publish(err))
  this.socket.once('close', () => console.log('websocket closed'))

  this.socket.pipe(through((buf, _, done) => {
    var resStr = String(buf)
    var response
    try {
      response = JSON.parse(resStr)
    } catch (_err) {
      console.error('!! JSON.parse error')
      console.log('data: "%s"', resStr)
      return done()
    }

    console.log(response)

    var method = '_' + response.method
    if (typeof this[method] === 'function') this[method](response.result)

    done()
  }))
}

Playlist.prototype.pushNotify = function (query) {
  this.setState({notify: query})
}

Playlist.prototype.removeNotify = function () {
  this.setState({notify: this.initialState.notify})
}

Playlist.prototype.findTrack = function (query) {
  var key = Object.keys(query)[0]
  var err
  if (key === '') {
    err = new Error('"a key of query" is not found')
    err.data = query
    err.name = 'PlaylistFindTrackError'
    return this.errors.publish(err)
  }
  var val = query[key]
  if (val === '') {
    err = new Error('"a value of query" is not found')
    err.data = query
    err.name = 'PlaylistFindTrackError'
    return this.errors.publish(err)
  }
  var title = `${key}: ${val}`
  var tracks = []

  this.jamendo.request('/tracks', xtend({
    limit: 60,
    imagesize: 70,
    order: 'popularity_week',
    type: 'single albumtrack'
  }, query))
  .once('error', err => this.errors.publish(err))
  .pipe(through.obj((track, _, done) => {
    tracks.push(this.getTrackInFavorites(track))
    done()
  }, done => {
    var search = {
      track: null,
      tracks: tracks,
      title: title
    }
    this.setState({playlists: xtend(this.state.playlists, {search: search})})
    done()
  }))
}

Playlist.prototype.getTrackInFavorites = function (track) {
  const tracks = this.state.playlists.favorites.tracks
  for (var i = 0; i < tracks.length; i++) {
    if (tracks[i].id === track.id) return tracks[i]
  }
  return track
}

Playlist.prototype.clearTrack = function () {
  this.setState({player: {}})
}

Playlist.prototype.selectTrack = function (actionPlayer) {
  this.clearTrack()

  var currentPlaylistName = actionPlayer.currentPlaylistName
  var playlists = this.state.playlists

  playlists[currentPlaylistName].track = actionPlayer.track

  this.setState({
    player: actionPlayer,
    playlists: playlists
  })
}

Playlist.prototype.nextTrack = function (actionPlayer) {
  this.clearTrack()

  var currentPlaylistName = actionPlayer.currentPlaylistName
  var playlists = this.state.playlists
  var playlist = playlists[currentPlaylistName]
  var track

  if (!playlist.tracks.length) {
    playlists[currentPlaylistName].track = actionPlayer.track
    return this.setState({playlists: playlists})
  }

  for (var i = 0; i < playlist.tracks.length; i++) {
    if (playlist.tracks[i].id === actionPlayer.track.id) {
      track = playlist.tracks[(i + 1) % playlist.tracks.length]
      playlists[currentPlaylistName].track = track
      return this.setState({
        player: {
          track: track,
          currentPlaylistName: currentPlaylistName
        },
        playlists: playlists
      })
    }
  }

  console.warn('.nextTrack - track not found')
  track = playlists[currentPlaylistName].tracks[0]
  playlists[currentPlaylistName].track = track
  this.setState({
    player: {
      track: track,
      currentPlaylistName: currentPlaylistName
    },
    playlists: playlists
  })
}

Playlist.prototype.addFavorites = function (track) {
  this.socket.write(JSON.stringify({
    method: 'addTrack',
    params: track,
    doBroadcast: true
  }))
}

Playlist.prototype._addTrack = function (track) {
  track.isFavo = true
  var playlists = this.state.playlists

  if (playlists.favorites.tracks.some(t => t.id === track.id)) {
    playlists.favorites.tracks = playlists.favorites.tracks.map(t => t.id === track.id ? track : t)
  } else {
    playlists.favorites.tracks = playlists.favorites.tracks.concat(track)
  }

  playlists.search.tracks = playlists.search.tracks.map(t => t.id === track.id ? track : t)

  var player = this.state.player
  if (player.track && player.track.id === track.id) {
    player.track = track
    this.setState({
      player: player,
      playlists: playlists
    })
  } else {
    this.setState({playlists: playlists})
  }
}

Playlist.prototype.removeFavorites = function (track) {
  this.socket.write(JSON.stringify({
    method: 'removeTrack',
    params: track,
    doBroadcast: true
  }))
}

Playlist.prototype._removeTrack = function (track) {
  delete track.isFavo

  var playlists = this.state.playlists

  playlists.favorites.tracks = playlists.favorites.tracks.filter(t => t.id !== track.id)
  playlists.search.tracks = playlists.search.tracks.map(t => t.id === track.id ? track : t)

  var player = this.state.player

  if (player.track && player.track.id === track.id) {
    player.track = track
    this.setState({
      player: player,
      playlists: playlists
    })
  } else {
    this.setState({playlists: playlists})
  }
}

Playlist.prototype.getAllTracks = function () {
  this.socket.write(JSON.stringify({method: 'getAllTracks'}))
}

Playlist.prototype._getAllTracks = function (tracks) {
  var playlists = this.state.playlists
  playlists.favorites.tracks = tracks.map(t => (t.isFavo = true) && t)
  this.setState({playlists: playlists})
}