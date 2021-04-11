const path = require('path')

if (process.env.IS_NODE !== 'true') {
  require('./electron')
}

const getPathToDotEnv = () => {
  const fileName =
    process.env.NODE_ENV === 'development' ? '.env' : '.env.production'

  if (process.env.IS_NODE !== 'true') {
    return path.resolve(require('electron').app.getAppPath(), fileName)
  }

  return fileName
}

require('dotenv').config({
  path: getPathToDotEnv(),
})

const { startWatching } = require('./watch')
const { authenticate } = require('./auth')
const storage = require('./storage')
const { loadConfig } = require('./config')

async function main() {
  try {
    console.info(`starting up...`)

    await loadConfig()

    await authenticate()

    startWatching()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
