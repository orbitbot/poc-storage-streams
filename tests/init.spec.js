let o       = require('ospec')
let Storage = require('../storage.js')
let Mock    = require('./mockStorageApi.js')

o.spec('initialization', () => {

  var storage
  o.beforeEach(() => { storage = undefined })

  o('invalid storage API', (done) => {
    try {
      storage = Storage({})
    } catch (e) {
      done()
    }
  })

  o('valid storage API', () => {
    storage = Storage(new Mock())
    o(storage).notEquals(undefined)
    o(typeof storage).equals('function')
  })

  o('loads previously stored values when initalized', () => {
    let check = 'sth'
    let mock = new Mock({ getItem : (v) => JSON.stringify(check) })
    mock.preloaded = check
    storage = Storage(mock)

    o(storage.preloaded()).equals(check)
    o(storage('preloaded')).equals(check)
  })
})
