var through = require('through2')

module.exports = Playlist

function Playlist (storage) {
  this.storage = storage
}

Playlist.prototype.addTrack = function (track) {
  return new Promise((resolve, reject) => {
    track.modified = Date.now()
    this.storage.put(track.id, track, (err) => {
      if (err) reject(err)
      else resolve(track)
    })
  })
}

Playlist.prototype.removeTrack = function (_track) {
  return new Promise((resolve, reject) => {
    this.storage.get(_track.id, (err, track) => {
      if (err && err.type !== 'NotFoundError') return reject(err)
      if (!track) return resolve()
      this.storage.del(_track.id, (err) => {
        if (err) return reject(err)
        else resolve(track)
      })
    })
  })
}

Playlist.prototype.getAllTracks = function () {
  return new Promise((resolve, reject) => {
    var tracks = []
    this.storage.createValueStream()
    .once('error', reject)
    .pipe(through.obj((track, _, done) => {
      tracks.push(track)
      done()
    }, done => {
      resolve(tracks.sort(sort))
      done()
    }))
  })

  function sort (A, B) {
    var a = A.modified
    var b = B.modified
    return a > b ? 1 : a < b ? -1 : 0
  }
}
