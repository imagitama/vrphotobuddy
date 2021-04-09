const chokidar = require('chokidar')
const path = require('path')
const { promises: fs } = require('fs')
const { getConfig } = require('./config')
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
  console.info('starting to watch...')

  console.info(`watch path: ${getConfig().PATH_TO_VRCHAT_PHOTOS}`)

  // TODO: Only use polling as fallback (using it because ubuntu for windows doesnt let you sub)
  chokidar
    .watch(getConfig().PATH_TO_VRCHAT_PHOTOS, {
      usePolling: true,
      ignoreInitial: true,
    })
    .on('add', async (filepath) => {
      console.info(`new photo detected: ${filepath}`)

      try {
      } catch {}

      await processPhoto(filepath)
    })

  console.info('now watching')
}
