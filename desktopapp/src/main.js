const path = require('path')

const getPathToDotEnv = () => {
  let pathToDotEnv
  const fileName =
    process.env.NODE_ENV === 'development' ? '.env' : '.env.production'

  if (process.env.IS_NODE !== 'true') {
    pathToDotEnv = path.resolve(
      require('electron').app.getAppPath(),
      process.env.NODE_ENV === 'development' ? '..' : '.',
      fileName
    )
  } else {
    pathToDotEnv = fileName
  }

  console.info(`using environment variables from: ${pathToDotEnv}`)

  return pathToDotEnv
}

require('dotenv').config({
  path: getPathToDotEnv(),
})

if (process.env.IS_NODE !== 'true') {
  require('./electron')
}

const { startWatching, waitForVrchatToClose } = require('./watch')
const { authenticate } = require('./auth')
const storage = require('./storage')
const { loadConfig } = require('./config')
const { processUnprocessedPhotos } = require('./photo')

async function main() {
  try {
    console.info(`starting up...`)

    await loadConfig()

    await authenticate()

    startWatching()

    await processUnprocessedPhotos()

    waitForVrchatToClose()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
