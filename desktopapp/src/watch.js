const chokidar = require('chokidar')
const path = require('path')
const { promises: fs } = require('fs')
const findProcess = require('find-process')
const { getConfig } = require('./config')
const { showDialog } = require('./electron')

let photosToProcess = []

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
    .on('add', async (filePath) => {
      console.info(`new photo detected: ${filePath}`)

      photosToProcess.push(filePath)
    })

  console.info('now watching')
}

const checkForVrchat = async () => {
  const searchResults = await findProcess('name', 'VRChat.exe')

  if (!searchResults.length) {
    return false
  }

  return true
}

const intervalBetweenChecks = 2000

const recursivelyWaitForVrchatToClose = async (callback) => {
  const result = await checkForVrchat()

  if (!result) {
    callback()
  } else {
    setTimeout(() => recursivelyWaitForVrchatToClose(callback), intervalBetweenChecks)
  }
}

const recursivelyWaitForVrchatToOpen = async (callback) => {
  const result = await checkForVrchat()

  if (result) {
    callback()
  } else {
    setTimeout(() => recursivelyWaitForVrchatToOpen(callback), intervalBetweenChecks)
  }
}

let isVrchatRunning = false

const waitForVrchatToClose = async () => {
  isVrchatRunning = await checkForVrchat()

  if (isVrchatRunning) {
    console.info('vrchat is already open, waiting for it to close...')

    recursivelyWaitForVrchatToClose(async () => {
      console.info('detected vrchat has been closed!')

      if (photosToProcess.length > 0) {
        console.info('showing dialog...')
        showDialog(photosToProcess)
      } else {
        console.info('no photos have been detected, skipping...')
      }

      console.info('waiting for vrchat to open again...')

      recursivelyWaitForVrchatToOpen(() => {
        console.info('vrchat has been opened while we are showing the dialog, waiting for it to close...')
        waitForVrchatToClose()
      })
    })
  } else {
    console.info('vrchat is not currently running, polling until it is running again...')

    recursivelyWaitForVrchatToOpen(() => {
      console.info('detected vrchat is now open!')

      waitForVrchatToClose()
    })
  }
}
module.exports.waitForVrchatToClose = waitForVrchatToClose