const chokidar = require('chokidar')
const path = require('path')
const { promises: fs } = require('fs')
const { PATH_TO_VRCHAT_PHOTOS } = require('./config')
const { processPhoto } = require('./photo')

const wait = (time) =>
  new Promise((resolve) => setTimeout(() => resolve(), time))

const waitForPhotoToBeReadable = async (path) => {
  return new Promise(async (resolve) => {
    try {
      fs.readFile(path)
    } catch (err) {
      console.log('file not readable - trying again in 50ms')
      await wait(50)
      await waitForPhotoToBeReadable(path)
    }
  })
}

module.exports.startWatching = () => {
  console.debug('starting to watch...')

  console.debug(`watch path: ${PATH_TO_VRCHAT_PHOTOS}`)

  // TODO: Only use polling as fallback (using it because ubuntu for windows doesnt let you sub)
  chokidar
    .watch(PATH_TO_VRCHAT_PHOTOS, { usePolling: true, ignoreInitial: true })
    .on('add', async (filepath) => {
      console.debug(`new photo detected: ${filepath}`)

      try {
      } catch {}

      await processPhoto(filepath)
    })

  console.debug('now watching')
}
