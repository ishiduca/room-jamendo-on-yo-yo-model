var yo = require('yo-yo')
var onload = require('on-load')

const AppName = 'RoomJamendoOnYoYoModel'

const Audio = (state, model) => {
  var audio = yo `
    <audio
      controls
      preload="metadata"
      src=${state.track.audio}
      onended=${ev => model.nextTrack(state)}}
    >
      <p>:(</p>
    </audio>
  `

  onload(audio, a => a.play(), a => {
    a.removeAttribute('src')
    a.load()
  })

  return audio
}

module.exports = (state, model) => {
  if (!state.track || !state.track.id) return yo `<div id="wrap-player"><h1>${AppName}</h1></div>`

  var methodName = state.track.isFavo ? 'removeFavorites' : 'addFavorites'
  var classFav = state.track.isFavo ? 'fa fa-heart' : 'fa fa-heart-o'
  return yo `
    <div id="wrap-player">
      <figure class="rows">
        <div>
          <img src=${state.track.image} />
        </div>
        <div>
          ${Audio(state, model)}
        </div>
        <figcaption class="track-meta">
          <h5>
            ${state.track.name}
            <span style="font-weight: normal;">(via ${state.track.album_name || 'single'})</span>
          </h5>
          <p>${state.track.artist_name}</p>
        </figcaption>
        <div>
          <a class="button"
            onclick=${ev => {
              ev.stopPropagation()
              model[methodName](state.track)
            }}
          >
            <i class=${classFav}></i>
          </a>
        </div>
      </figure>
    </div>
  `
}
