const open = require('open')
const storage = require('./storage')
const config = require('./config')
const express = require('express')

let isAuthenticated = false
const storageKeyOAuthToken = 'oauth-token'
const storageKeyOAuthTokenExpiryMs = 'oauth-token-expiry'
let validAccessToken

// class NoOAuthTokenError extends Error {
//   constructor() {
//     super('No oauth token in storage')
//   }
// }

const getNewOAuthTokenAndExpiry = async () => {
  return new Promise((resolve, reject) => {
    console.debug('authorizing with oauth...')

    const app = express()

    app.get('/oauth/redirect_uri', (req, res) => {
      const accessToken = req.query.access_token
      const expiresIn = req.query.expires_in

      console.debug(`webserver was redirected with data`, req.query)

      res
        .status(200)
        .send(
          '<style>body { background: black; color: white; padding: 100px; font-size: 200%; font-family: sans-serif; }</style>You have authenticated successfully and you can close this browser tab'
        )
      resolve({ accessToken, expiresIn })
    })

    // TODO: Configure port with env
    app.listen(config.OAUTH_REDIRECT_WEBSERVER_PORT, () => {
      console.debug(
        `waiting for oauth response on port ${config.OAUTH_REDIRECT_WEBSERVER_PORT}`
      )
    })

    open(config.OAUTH_AUTHORIZE_URL)
  })
}

const getIsTokenValid = async (token) => {
  const storedOAuthTokenExpiryMs = await storage.getItem(
    storageKeyOAuthTokenExpiryMs
  )

  if (!storedOAuthTokenExpiryMs) {
    console.debug('token invalid: no expiry stored')
    return false
  }

  console.debug(`expiry: ${storedOAuthTokenExpiryMs}`)

  const dateNow = new Date()
  const expiryDate = new Date(storedOAuthTokenExpiryMs)
  const diffDate = dateNow - expiryDate

  console.debug(`current date: ${dateNow}`)
  console.debug(`expiry date: ${expiryDate}`)

  if (dateNow > expiryDate) {
    console.debug(
      `token invalid: expired on ${expiryDate} and the diff is ${diffDate}`
    )
    return false
  }

  return true
}

const convertMinutesToMilliseconds = (mins) => mins * 60 * 1000

const authenticate = async () => {
  console.debug(`authenticating...`)

  const storedOAuthToken = await storage.getItem(storageKeyOAuthToken)
  let needsNewToken = false

  if (storedOAuthToken) {
    console.debug(`found existing token: ${storedOAuthToken}`)

    if (await getIsTokenValid(storedOAuthToken)) {
      validAccessToken = storedOAuthToken
      console.debug('token is still valid')
    } else {
      console.debug('token has expired!')
      needsNewToken = true
    }
  } else {
    console.debug('could not find an existing token')
    needsNewToken = true
  }

  if (needsNewToken) {
    const { accessToken, expiresIn } = await getNewOAuthTokenAndExpiry()
    validAccessToken = accessToken
    await storage.setItem(storageKeyOAuthToken, accessToken)

    const expiryAsUnixTimestampMs =
      Date.now() + convertMinutesToMilliseconds(expiresIn / 60)
    await storage.setItem(storageKeyOAuthTokenExpiryMs, expiryAsUnixTimestampMs)

    console.debug(`using new token: ${validAccessToken}`)
    console.debug(`expires in: ${expiryAsUnixTimestampMs}`)
  }

  isAuthenticated = true
  return true
}
module.exports.authenticate = authenticate

const getOAuthToken = () => validAccessToken
module.exports.getOAuthToken = getOAuthToken
