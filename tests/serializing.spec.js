let o       = require('ospec')
let Storage = require('../storage.js')
let Mock    = require('./mockStorageApi.js')

o.spec('serializing', () => {

  var storage
  o.beforeEach(() => { storage = undefined })

  o('supports custom serialize method', () => {
    let slz = o.spy((v) => v)
    let value = '12341'
    storage = Storage(new Mock(), { serialize : slz })

    storage('key', value)

    o(slz.callCount).equals(1)
    o(slz.args[0]).equals(value)
  })

  o('supports custom deserialize method', () => {
    let dslz = o.spy((v) => v)
    let check = {}
    let mock = new Mock({ getItem : () => check })
    mock.preloaded = 'sth'
    storage = Storage(mock, { deserialize : dslz })

    o(dslz.callCount).equals(1)
    o(storage.preloaded()).equals(check)

    let value = storage('preloaded')
    o(dslz.callCount).equals(2)
    o(value).equals(check)
  })
})
