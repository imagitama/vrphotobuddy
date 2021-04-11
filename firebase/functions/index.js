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
const authorizeApp = authorize()
const authenticationApp = customAuthentication(getCustomAuthenticationUrl())
exports.token = token()
exports.authorize = authorizeApp
exports.authentication = authenticationApp

// this deletes expired tokens
// exports.garbageCollection = garbageCollection()

// photos
exports.uploadPhoto = require('./src/functions/uploadPhoto')
exports.syncPhotoList = require('./src/functions/syncPhotoList')
exports.hydratePhotoListOnPhotoUpload = require('./src/functions/hydratePhotoListOnPhotoUpload')

const functions = require('firebase-functions')
const express = require('express')

const handleAuthorizeApp = express()
handleAuthorizeApp.get('/authorize/entry', (req, res) => {
  req.url = '/entry'
  authorizeApp(req, res)
})
handleAuthorizeApp.all('*', (req, res) => {
  res.status(404).send(`handleAuthorize 404 not found ${req.url}`)
})
exports.handleAuthorize = functions.https.onRequest(handleAuthorizeApp)

const handleAuthenticationApp = express()
handleAuthenticationApp.get('/authentication', (req, res) => {
  req.url = '/'
  authenticationApp(req, res)
})
handleAuthenticationApp.post('/authentication', (req, res) => {
  req.url = '/'
  authenticationApp(req, res)
})
handleAuthenticationApp.options('/authentication', (req, res) => {
  req.url = '/'
  authenticationApp(req, res)
})
handleAuthenticationApp.all('*', (req, res) => {
  res.status(404).send(`handleAuthentication 404 not found ${req.url}`)
})
exports.handleAuthentication = functions.https.onRequest(
  handleAuthenticationApp
)
