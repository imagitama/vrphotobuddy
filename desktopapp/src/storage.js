const Store = require('electron-store')

const store = new Store()

const getItem = (key) => Promise.resolve(store.get(key))
module.exports.getItem = getItem

const setItem = (key, val) => Promise.resolve(store.set(key, val))
module.exports.setItem = setItem

const keys = {
  lastKnownTime: 'last-known-time',
}
module.exports.keys = keys
