"use strict"

import stream from 'mithril/stream'

export default function Storage (store, { namespace   = '',
                                          serialize   = JSON.stringify,
                                          deserialize = JSON.parse
                                        } = {}) {
  if (!store || typeof store.getItem !== 'function' || typeof store.setItem !== 'function' || typeof store.removeItem !== 'function') {
    throw new Error('constructor parameter does not conform to Web Storage API')
  }

  let api = (key, value, clear) => {
    let storeKey = namespace + key

    if (key && clear === true) {
      store.removeItem(storeKey)
      if (api[key]) {
        api[key].end(true)
        delete api[key]
      }
    } else if (value) {
      if (api[key]) {
        api[key](value)
      } else {
        api[key] = stream(value)
        api[key].map((v) => store.setItem(storeKey, serialize(v)))
        return api[key]
      }
    } else {
      return deserialize(store.getItem(storeKey))
    }
  }

  let prefix = new RegExp(`^${ namespace }`)

  Object.keys(store)
    .filter((k) => store.hasOwnProperty(k))
    .filter((k) => prefix.test(k))
    .forEach((k) => api[ k.slice(namespace.length) ] = stream(deserialize(store.getItem(k))))

  return api
}
