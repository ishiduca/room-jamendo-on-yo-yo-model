var yo = require('yo-yo')

module.exports = (state, model, currentPlaylistName) => yo `
  <div>
    <h3>${state.title || currentPlaylistName}</h3>
    ${state.tracks.map(t => {
      var classFav = t.isFavo ? 'fa fa-heart' : 'fa fa-heart-o'
      var classTrack = state.track && (t.id === state.track.id) ? 'rows track is-focus' : 'rows track'
      var methodName = t.isFavo ? 'removeFavorites' : 'addFavorites'
      return yo `
        <div class=${classTrack}>
          <div>
            <a
              onclick=${ev => {
                ev.stopPropagation()
                model.selectTrack({
                  currentPlaylistName: currentPlaylistName,
                  track: t
                })
              }}
            >
              <img src=${t.image} />
            </a>
          </div>
          <div class="track-meta" style="flex-grow: 1">
            <h5>
              <a href=${t.shareurl} target="_blank">${t.name}</a>
              <span style="font-weight: normal;">(via ${t.album_name || 'single'})</span>
            </h5>
            <p>${t.artist_name}</p>
          </div>
          <div>
            <a
              class="button"
              onclick=${ev => {
                ev.stopPropagation()
                model[methodName](t)
              }}
            >
              <i class=${classFav}></i>
            </a>
          </div>
        </div>
      `
    })}
  </div>
`
