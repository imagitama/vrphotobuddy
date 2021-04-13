let currentStatusText = ''
let listeners = []

const setStatus = (statusText) => {
  currentStatusText = statusText

  for (const listener of listeners) {
    listener(currentStatusText)
  }
}
module.exports.setStatus = setStatus

const getStatus = () => {
  return currentStatusText
}
module.exports.getStatus = getStatus

const addListener = (cb) => {
  listeners.push(cb)
}
module.exports.addListener = addListener
