const open = require('open')
const storage = require('./storage')
const config = require('./config')
const express = require('express')

let isAuthenticated = false
const storageKeyOAuthToken = 'oauth-token'
let validAccessToken

// class NoOAuthTokenError extends Error {
//   constructor() {
//     super('No oauth token in storage')
//   }
// }

const getNewOAuthToken = async () => {
  return new Promise((resolve, reject) => {
    console.debug('authorizing with oauth...')

    const app = express()

    app.get('/oauth/redirect_uri', (req, res) => {
      const accessToken = req.query.access_token
      res.status(200).send('You have logged in successfully: ' + accessToken)
      resolve(accessToken)
    })

    // TODO: Configure port with env
    app.listen(3001, () => {
      console.debug('waiting for oauth response on port 3001')
    })

    open(config.OAUTH_AUTHORIZE_URL)
  })
}

const authenticate = async () => {
  console.debug(`authenticating...`)

  const storedOAuthToken = await storage.getItem(storageKeyOAuthToken)

  // TODO: Check for expiry
  if (storedOAuthToken) {
    validAccessToken = storedOAuthToken
    console.debug(`using existing token: ${validAccessToken}`)
  } else {
    validAccessToken = await getNewOAuthToken()
    await storage.setItem(storageKeyOAuthToken, validAccessToken)
    console.debug(`using new token: ${validAccessToken}`)
  }

  isAuthenticated = true
  return true
}
module.exports.authenticate = authenticate

const getOAuthToken = () => validAccessToken
module.exports.getOAuthToken = getOAuthToken
