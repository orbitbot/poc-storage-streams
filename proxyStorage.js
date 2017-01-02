(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('ProxyStorage', factory) :
	(global.ProxyStorage = factory());
}(this, (function () { 'use strict';

var guid = 0;
var HALT = {};
function createStream() {
	function stream() {
		if (arguments.length > 0 && arguments[0] !== HALT) { updateStream(stream, arguments[0]); }
		return stream._state.value
	}
	initStream(stream);

	if (arguments.length > 0 && arguments[0] !== HALT) { updateStream(stream, arguments[0]); }

	return stream
}
function initStream(stream) {
	stream.constructor = createStream;
	stream._state = {id: guid++, value: undefined, state: 0, derive: undefined, recover: undefined, deps: {}, parents: [], endStream: undefined};
	stream.map = stream["fantasy-land/map"] = map, stream["fantasy-land/ap"] = ap, stream["fantasy-land/of"] = createStream;
	stream.valueOf = valueOf, stream.toJSON = toJSON, stream.toString = valueOf;

	Object.defineProperties(stream, {
		end: {get: function() {
			if (!stream._state.endStream) {
				var endStream = createStream();
				endStream.map(function(value) {
					if (value === true) { unregisterStream(stream), unregisterStream(endStream); }
					return value
				});
				stream._state.endStream = endStream;
			}
			return stream._state.endStream
		}}
	});
}
function updateStream(stream, value) {
	updateState(stream, value);
	for (var id in stream._state.deps) { updateDependency(stream._state.deps[id], false); }
	finalize(stream);
}
function updateState(stream, value) {
	stream._state.value = value;
	stream._state.changed = true;
	if (stream._state.state !== 2) { stream._state.state = 1; }
}
function updateDependency(stream, mustSync) {
	var state = stream._state, parents = state.parents;
	if (parents.length > 0 && parents.every(active) && (mustSync || parents.some(changed))) {
		var value = stream._state.derive();
		if (value === HALT) { return false }
		updateState(stream, value);
	}
}
function finalize(stream) {
	stream._state.changed = false;
	for (var id in stream._state.deps) { stream._state.deps[id]._state.changed = false; }
}

function combine(fn, streams) {
	if (!streams.every(valid)) { throw new Error("Ensure that each item passed to m.prop.combine/m.prop.merge is a stream") }
	return initDependency(createStream(), streams, function() {
		return fn.apply(this, streams.concat([streams.filter(changed)]))
	})
}

function initDependency(dep, streams, derive) {
	var state = dep._state;
	state.derive = derive;
	state.parents = streams.filter(notEnded);

	registerDependency(dep, state.parents);
	updateDependency(dep, true);

	return dep
}
function registerDependency(stream, parents) {
	for (var i = 0; i < parents.length; i++) {
		parents[i]._state.deps[stream._state.id] = stream;
		registerDependency(stream, parents[i]._state.parents);
	}
}
function unregisterStream(stream) {
	for (var i = 0; i < stream._state.parents.length; i++) {
		var parent = stream._state.parents[i];
		delete parent._state.deps[stream._state.id];
	}
	for (var id in stream._state.deps) {
		var dependent = stream._state.deps[id];
		var index = dependent._state.parents.indexOf(stream);
		if (index > -1) { dependent._state.parents.splice(index, 1); }
	}
	stream._state.state = 2; //ended
	stream._state.deps = {};
}

function map(fn) {return combine(function(stream) {return fn(stream())}, [this])}
function ap(stream) {return combine(function(s1, s2) {return s1()(s2())}, [stream, this])}
function valueOf() {return this._state.value}
function toJSON() {return this._state.value != null && typeof this._state.value.toJSON === "function" ? this._state.value.toJSON() : this._state.value}

function valid(stream) {return stream._state }
function active(stream) {return stream._state.state === 1}
function changed(stream) {return stream._state.changed}
function notEnded(stream) {return stream._state.state !== 2}

function merge(streams) {
	return combine(function() {
		return streams.map(function(s) {return s()})
	}, streams)
}
createStream["fantasy-land/of"] = createStream;
createStream.merge = merge;
createStream.combine = combine;
createStream.HALT = HALT;

var stream$2 = createStream;

var stream = stream$2;

function ProxyStorage(store, ref) {
  if ( ref === void 0 ) ref = {};
  var namespace = ref.namespace; if ( namespace === void 0 ) namespace = '';
  var serialize = ref.serialize; if ( serialize === void 0 ) serialize = JSON.stringify;
  var deserialize = ref.deserialize; if ( deserialize === void 0 ) deserialize = JSON.parse;

  if (!store || typeof store.getItem !== 'function' || typeof store.setItem !== 'function' || typeof store.removeItem !== 'function') {
    throw new Error('constructor parameter does not conform to Web Storage API')
  }

  var streams = {};
  var proxy = new Proxy(function () { return streams; }, {
    get : function (t, key) { return streams[key] && streams[key](); },
    set : function (t, key, value) {
      if (streams[key]) {
        streams[key](value);
      } else {
        streams[key] = stream(value);
        streams[key].map(function (v) { return store.setItem(namespace + key, serialize(v)); });
      }
      return true
    },
    deleteProperty : function (t, key) {
      storage.removeItem(key);
      if (streams[key]) { streams[key].end(true); }
      delete streams[key];
    },
  });

  var prefix = new RegExp(("^" + namespace));

  Object.keys(store)
    .filter(function (k) { return store.hasOwnProperty(k); })
    .filter(function (k) { return prefix.test(k); })
    .forEach(function (k) { return proxy[ k.slice(namespace.length) ] = deserialize(store.getItem(k)); });

  return proxy
}

return ProxyStorage;

})));
