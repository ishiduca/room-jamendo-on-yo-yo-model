var yo = require('yo-yo')

var isDisplayOff = {
  display: 'none'
}
var isDisplayOn = {
  display: 'block',
  position: 'fixed',
  bottom: 0,
  width: '100%',
  'z-index': 2,
  padding: '1em 2em',
  'background-color': '#ffcccc',
  cursor: 'pointer'
}

function toStyle (o) {
  return Object.keys(o).map(k => [k, o[k]].join(':')).join(';')
}

module.exports = (state, model) => yo `
    <div
      style=${
        state.message ? toStyle(isDisplayOn) : toStyle(isDisplayOff)
      }
      onclick=${ev => model.removeNotify()}
    >
        <div id="notify">
            <h2>${state.message || ''}</h2>
            <p>${
                  (!state.data)
                    ? ''
                    : (typeof state.data === 'string')
                      ? state.data
                      : JSON.stringify(state.data)
            }</p>
        </div>
    </div>
`
