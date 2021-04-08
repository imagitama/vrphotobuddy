const path = require('path')

// TODO: Use default or check registry etc
// TODO: If not found ask user for path
module.exports.PATH_TO_VRCHAT_PHOTOS = path.resolve(
  process.env.VRPHOTOBUDDY_DEFAULT_PHOTO_PATH
)

module.exports.OAUTH_AUTHORIZE_URL =
  process.env.VRPHOTOBUDDY_OAUTH_AUTHORIZE_URL

// TODO: Use env var?
module.exports.OAUTH_REDIRECT_WEBSERVER_PORT = 3001
