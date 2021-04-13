const path = require('path')
const { promises: fs, constants } = require('fs')
const os = require('os')

const pathToConfigFile = path.resolve(os.homedir(), 'vrphotobuddy.json')

let config = {
  PATH_TO_VRCHAT_PHOTOS: 'NO_PATH',
  OAUTH_AUTHORIZE_URL: 'NO_URL',
  OAUTH_REDIRECT_WEBSERVER_PORT: 1234,
}

const getConfig = () => {
  return config
}
module.exports.getConfig = getConfig

const doesConfigFileExist = async () => {
  try {
    await fs.access(pathToConfigFile, constants.F_OK)
    return true
  } catch (err) {
    return false
  }
}

const readConfigFile = async () => {
  const newConfigJson = await fs.readFile(pathToConfigFile)
  const newConfig = JSON.parse(newConfigJson)
  return newConfig
}

const loadConfig = async () => {
  console.info('loading config...')

  console.info(`path to custom config file: ${pathToConfigFile}`)

  let PATH_TO_VRCHAT_PHOTOS
  const OAUTH_AUTHORIZE_URL = process.env.VRPHOTOBUDDY_OAUTH_AUTHORIZE_URL
  const OAUTH_REDIRECT_WEBSERVER_PORT = 3001

  if (await doesConfigFileExist()) {
    console.info('custom config file found, using...')

    const configFile = await readConfigFile()

    console.info('custom config file', configFile)

    if (configFile.PATH_TO_VRCHAT_PHOTOS) {
      PATH_TO_VRCHAT_PHOTOS = configFile.PATH_TO_VRCHAT_PHOTOS
    }
  } else {
    console.info('no custom config found, skipping...')

    PATH_TO_VRCHAT_PHOTOS = process.env.VRPHOTOBUDDY_DEFAULT_PHOTO_PATH
  }

  PATH_TO_VRCHAT_PHOTOS = PATH_TO_VRCHAT_PHOTOS.replace('~', os.homedir())

  console.info(`config has been loaded`)
  console.info(`path to VRChat photos: ${PATH_TO_VRCHAT_PHOTOS}`)
  console.info(`oauth authorize URL: ${OAUTH_AUTHORIZE_URL}`)
  console.info(`webserver port: ${OAUTH_REDIRECT_WEBSERVER_PORT}`)

  config = {
    PATH_TO_VRCHAT_PHOTOS,
    OAUTH_AUTHORIZE_URL,
    OAUTH_REDIRECT_WEBSERVER_PORT,
  }
}
module.exports.loadConfig = loadConfig
