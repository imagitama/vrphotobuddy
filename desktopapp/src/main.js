require('dotenv').config()

const { startWatching } = require('./watch')
const { authenticate } = require('./auth')
const storage = require('./storage')

async function main() {
  try {
    console.debug(`starting up...`)

    await storage.init()

    await authenticate()

    startWatching()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
