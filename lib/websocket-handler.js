var isPromise = require('is-promise')
var through = require('through2')
var sockets = []

function broadcast (str) {
  sockets.forEach(socket => socket.write(str))
}

module.exports = (context) => through(function (buf, _, done) {
  var str = String(buf)
  var req
  try {
    req = JSON.parse(str)
  } catch (_err) {
    console.error('JSON.parse error')
    console.log('data: "%s"', str)
    return done()
  }

  var p = help(req)
  if (isPromise(p)) {
    p.then(result => {
      var payload = {
        method: req.method,
        result: result
      }
      var res = JSON.stringify(payload)
      req.doBroadcast ? broadcast(res) : this.push(res)
    })
    .catch(err => console.error(err))
  }

  done()

  function help (req) {
    var m = req.method
    var p = context.playlist
    if (typeof p[m] === 'function') return p[m](req.params)
  }
})
.on('pipe', function (socket) {
  sockets.push(socket)
  socket.once('close', () => socket.unpipe(this))
})
.on('unpipe', function (socket) {
  this.unpipe(socket)
  sockets = sockets.filter(s => s !== socket)
})
