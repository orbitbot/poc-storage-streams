let o       = require('ospec')
let Storage = require('../storage.js')
let Mock    = require('./mockStorageApi.js')

o.spec('namespace', () => {

  var storage
  o.beforeEach(() => { storage = undefined })

  o('loads existing namespaced keys', () => {
    let namespace = 'ns::'
    let check = {}
    let mock = new Mock({ getItem : () => check })
    mock['ns::loaded'] = 'sth'
    mock['not-loaded'] = 'other'
    storage = Storage(mock, { namespace, deserialize : (v) => v })

    o(storage['loaded']()).equals(check)
    o(storage['not-loaded']).equals(undefined)
  })

  o('stores values inside namespace', () => {
    let namespace = 'ns::'
    let mock = new Mock()
    storage = Storage(mock, { namespace })

    storage('prefixed', 'sth')
    o(mock.setItem.args[0]).equals('ns::prefixed')
  })
})
