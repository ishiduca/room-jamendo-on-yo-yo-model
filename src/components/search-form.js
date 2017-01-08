var yo = require('yo-yo')

var options = [
  {value: 'name', text: 'track name'},
  {value: 'namesearch', text: 'search track by name'},
  {value: 'artist_name', text: 'artist name'},
  {value: 'album_name', text: 'album name'},
  {value: 'tags', text: 'tags (and)'},
  {value: 'fuzzytags', text: 'tags (or)'},
  {value: 'search', text: 'a free text'}
]

module.exports = (state, model) => yo `
  <div id="wrap-search-form">
    <form onsubmit=${ev => {
      ev.preventDefault()
      model.findTrack(
        ev.target.querySelector('select').value,
        ev.target.querySelector('input[type="search"]').value
      )
    }}>
      <div class="rows is-left">
        <div>
          <select>
            ${options.map(opt => yo `
              ${
                (state.key === opt.value)
                  ? yo `<option value=${opt.value} selected="slected">${opt.text}</option>`
                  : yo `<option value=${opt.value}>${opt.text}</option>`
              }
            `)}
          </select>
        </div>
        <div>
          <input
            type="search"
            placeholder="keyword"
            value=${state.val || ''}
            required
          />
        </div>
      </div>
    </form>
  </div>
`
