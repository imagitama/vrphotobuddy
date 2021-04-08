exports.onUserUpdated = require('./src/functions/onUserUpdated')
exports.onUserSignup = require('./src/functions/onUserSignup')

exports.optimizeImage = require('./src/functions/optimizeImage')
exports.loginWithDiscord = require('./src/functions/loginWithDiscord')
exports.downloadAndOptimizeDiscordAvatar = require('./src/functions/downloadAndOptimizeDiscordAvatar')

// oauth
// NOTE: Do these at the end or errors!
const { getCustomAuthenticationUrl } = require('./src/oauth')
const {
  authorize,
  customAuthentication,
  garbageCollection,
  token,
} = require('oauth2-firebase-auth')
exports.token = token()
exports.authorize = authorize()
exports.authentication = customAuthentication(getCustomAuthenticationUrl())
exports.garbageCollection = garbageCollection()

// photos
exports.uploadPhoto = require('./src/functions/uploadPhoto')
