const o = require('ospec')

module.exports = function Mock({ getItem = o.spy(), setItem = o.spy(), removeItem = o.spy() } = {}) {
  Object.defineProperty(this, 'getItem', { value : getItem })
  Object.defineProperty(this, 'setItem', { value : setItem })
  Object.defineProperty(this, 'removeItem', { value: removeItem })
}
