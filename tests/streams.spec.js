let o       = require('ospec')
let Storage = require('../storage.js')
let Mock    = require('./mockStorageApi.js')

o.spec('streams', () => {

  var storage
  o.beforeEach(() => { storage = undefined })

  o('stored values are observable', (done) => {
    let value = '12341'
    storage = Storage(new Mock())

    storage('key', value)
    storage['key'].map((v) => {
      o(v).equals(value)
      done()
    })
  })
})
