# poc-storage-streams
> Proof of concept implementation of an observable storage with streams

_**Disclaimer:**_ the code presented here is functional and even supplied with some tests, but should not be used as such, since it might not be appropriate for your environment and needs. This has mostly been written out of intellectual curiosity, and is presented as a POC or reference, in actual usage you might be interested in adopting one of the alternative approaches discussed below (with potential browser support caveats) and add further error handling, proxy traps or relevant property descriptors. It may also be preferable to write an implementation with similar fundamentals that uses the standard [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) instead of the alternatives presented here.

<br>

### What?

This repository contains a proof of concept level implementation of a wrapper for objects supporting the Storage API that extends them with observable streams. Streams here is intended to be understood as the functional programming concept and not Node.js data streams.

### Why?

Observable data allows a neat way to react to changes, and an implementation that is backed by "permanent" storage allows for a lot of developer convenience. Using a (fp) streams library for this is just for illustrative purposes, any observer-like implementation would do, but more advanced implementations do grant the benefits of f.e. merging and composing, running code only when multiple data has changed and so on.

### How?

The example implementation is a factory method that returns a single function used to query, set and remove items from the wrapped storage. This approach was in retrospect arbitrarily chosen over something mimicing the Storage API for somewhat more terse usage. Values set using the API are automatically stored to the Storage API-supporting object passed when initializing the storage, and are available directly on the storage object as [Mithril streams](https://github.com/lhorie/mithril.js/blob/rewrite/docs/stream.md), which support observing changes amongst other things, with a small payload.

- [Simple demo environment on GH pages](https://orbitbot.github.io/poc-storage-streams/)

```javascript
let storage = new Storage(window.localStorage)

console.log(storage('key')) // getter, logs undefined as nothing has yet been stored

// stores the second parameter in the wrapped storage object (localStorage)
// and sets up a Mithril stream
storage('key', 42)

console.log(window.localStorage.key) // logs 42
console.log(storage('key')) // logs 42

// we can amongst other things attach callbacks to run whenever the stored value is changed
storage['key'].map((v) => console.log(`"key" changed to $[ v }`))

storage('key', 43) // logs "key changed to 43" and updates localStorage

// values can be removed by passing true as a third parameter to the function, this also
// ends the streams and clears localStorage
storage('key', '', true) // the second parameter can be anything, it's ignored
```

The example also supports some advanced usage patterns such as custom serializing and deserializing methods and transparent namespaces for the stored keys.

```javascript
let storage = new Storage(window.localStorage, { namespace : 'ns::' })

storage('key', 'value')

// value is now stored to localStorage with a prefix
console.log(window.localStorage.key) // logs undefined
console.log(window.localStorage['ns::key']) // logs "value"
```

Custom serializing and deserializing methods can be used f.e. to store more complex objects or functions in the wrapped storage object.

**Links**
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
- https://github.com/lhorie/mithril.js/blob/rewrite/docs/stream.md

<br>
### Alternative approaches

##### Using `Object.defineProperty

`Object.defineProperty` is an alternative way of implementing an observable storage, where it's possible to use "natural" assignment syntax to change existing values such as in the following example.

```javascript
// populate localStorage with something to load into our storage implementation
window.localStorage['preloaded'] = 42

let storage = new Storage(window.localStorage)
storage['preloaded'].map((v) => console.log(`preloaded changed to ${ v }`))

storage['preloaded'] = Math.PI // logs the updated value to console and updates localStorage

// other assignments to our storage are not automatically saved in localstorage!
storage['other'] = 'this is not stored'

// the function call approach is required for correct functionality
storage('works', 'this is stored')
```

An implementation of this approach has not been published in this repository (to some degree in favor of Proxy, see below), since the benefits are not particularly significant as special syntax is still required to properly add new observable values. In a situation where all object keys are known at start or very few will be added, this approach could be considered if the somewhat nicer syntax seems beneficial enough.

Support for `Object.defineProperty` is fairly robust, with IE9 and Android 4.4 on [the compatibility list](http://kangax.github.io/compat-table/es5/#test-Object_static_methods_Object.defineProperty).

**Links**
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
- http://kangax.github.io/compat-table/es5/#test-Object_static_methods_Object.defineProperty

<br>
##### Using Proxy

In some modern es6 environments (FF, Chrome, Safari 10, Edge) it's possible to use [Proxy](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy), a new javascript feature for metaprogramming, to implement observable storage with streams neatly. The key benefit of Proxies over the above approaches is "catch all" setter functions, where code can be run when a proxy is assigned previously unknown keys. This allows for syntax that mimics normal objects or f.e. localStorage, while still providing access to observable streams of all proxied values.

- [Simple demo environment on GH pages](https://orbitbot.github.io/poc-storage-streams/proxy.html)

```javascript
let storage = new ProxyStorage(window.localStorage)

// property assignment now stores to localStorage as well!
storage.something = 42
console.log(window.localStorage.something) // logs "42"

// calling the storage method itself returns all the streams, so we can
// still easily attach callbacks
console.log(storage())

storage().something.map((v) => console.log(`2 + 2 = ${ v }`)) // logs "2 + 2 = 42"
storage.something = 4 // logs "2 + 2 = 4"
```

Using the Proxy approach is preferable for much neater usage, but [browser support](https://kangax.github.io/compat-table/es6/#test-Proxy) is unfortunately still lacking. It may be a nice approach if you can guarantee that users are only using recent browsers, since there is no way to polyfill this particular functionality.

**Links**
 - https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 - https://kangax.github.io/compat-table/es6/#test-Proxy
