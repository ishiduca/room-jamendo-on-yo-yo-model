const test = require('tape')
const path = require('path')
const levelup = require('levelup')
const dbPath = path.join(__dirname, 'dbs/jamendo/favorites')
const storage = levelup(dbPath, {valueEncoding: 'json'})
const Playlist = require('playlist')
const playlist = new Playlist(storage)

test('playlist.addTrack(track)', t => {
  playlist.addTrack({id: '123456', name: '1st track'}).then(track => {
    t.is(track.id, '123456', 'track.id eq "123456"')
    t.is(track.name, '1st track', 'track.name eq "1st track"')
    t.ok(track.modified <= Date.now(), `track.modified over Date.now() "${track.modified}"`)
    t.end()
  })
})

test('playlist.addTrack(track) # override', t => {
  playlist.addTrack({id: '123456', name: '1st TRACK'}).then(track => {
    t.is(track.id, '123456', 'track.id eq "123456"')
    t.is(track.name, '1st TRACK', 'track.name eq "1st TRACK"')
    t.end()
  })
})

test('playlist.removeTrack(track)', t => {
  playlist.removeTrack({id: '123456', name: 'hoge'}).then(track => {
    t.is(track.id, '123456', 'track.id eq "123456"')
    t.is(track.name, '1st TRACK', 'track.name eq "1st TRACK"')
    t.ok(track.modified, `track.modified "${track.modified}"`)
    t.end()
  })
})

test('playlist.removeTrack(noExistsTrack)', t => {
  playlist.removeTrack({id: '345678', name: 'hoge'}).then(track => {
    t.notOk(track, 'track not found')
    t.end()
  })
})
