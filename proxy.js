"use strict"

import stream from 'mithril/stream'

export default function ProxyStorage(store, { namespace   = '',
                                              serialize   = JSON.stringify,
                                              deserialize = JSON.parse
                                            } = {}) {
  if (!store || typeof store.getItem !== 'function' || typeof store.setItem !== 'function' || typeof store.removeItem !== 'function') {
    throw new Error('constructor parameter does not conform to Web Storage API')
  }

  let streams = {}
  let proxy = new Proxy(() => streams, {
    get : (t, key) => streams[key] && streams[key](),
    set : (t, key, value) => {
      if (streams[key]) {
        streams[key](value)
      } else {
        streams[key] = stream(value)
        streams[key].map((v) => store.setItem(namespace + key, serialize(v)))
      }
      return true
    },
    deleteProperty : (t, key) => {
      storage.removeItem(key)
      if (streams[key]) streams[key].end(true)
      delete streams[key]
    },
  })

  let prefix = new RegExp(`^${ namespace }`)

  Object.keys(store)
    .filter((k) => store.hasOwnProperty(k))
    .filter((k) => prefix.test(k))
    .forEach((k) => proxy[ k.slice(namespace.length) ] = deserialize(store.getItem(k)))

  return proxy
}
