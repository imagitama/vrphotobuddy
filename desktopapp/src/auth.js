const open = require('open')
const storage = require('./storage')
const { getConfig } = require('./config')
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
    console.info('authorizing with oauth...')

    const app = express()

    app.get('/oauth/redirect_uri', (req, res) => {
      const accessToken = req.query.access_token
      const expiresIn = req.query.expires_in

      console.info(`webserver was redirected with data`, req.query)

      res
        .status(200)
        .send(
          '<style>body { background: black; color: white; padding: 100px; font-size: 200%; font-family: sans-serif; }</style>You have authenticated successfully and you can close this browser tab'
        )
      resolve({ accessToken, expiresIn })
    })

    // TODO: Configure port with env
    app.listen(getConfig().OAUTH_REDIRECT_WEBSERVER_PORT, () => {
      console.info(
        `waiting for oauth response on port ${
          getConfig().OAUTH_REDIRECT_WEBSERVER_PORT
        }`
      )
    })

    open(getConfig().OAUTH_AUTHORIZE_URL)
  })
}

const getIsTokenValid = async (token) => {
  const storedOAuthTokenExpiryMs = await storage.getItem(
    storageKeyOAuthTokenExpiryMs
  )

  if (!storedOAuthTokenExpiryMs) {
    console.info('token invalid: no expiry stored')
    return false
  }

  console.info(`expiry: ${storedOAuthTokenExpiryMs}`)

  const dateNow = new Date()
  const expiryDate = new Date(storedOAuthTokenExpiryMs)
  const diffDate = dateNow - expiryDate

  console.info(`current date: ${dateNow}`)
  console.info(`expiry date: ${expiryDate}`)

  // if (dateNow > expiryDate) {
  //   console.info(
  //     `token invalid: expired on ${expiryDate} and the diff is ${diffDate}`
  //   )
  //   return false
  // }

  return true
}

const convertMinutesToMilliseconds = (mins) => mins * 60 * 1000

const authenticate = async () => {
  console.info(`authenticating...`)

  const storedOAuthToken = await storage.getItem(storageKeyOAuthToken)
  let needsNewToken = false

  if (storedOAuthToken) {
    console.info(`found existing token: ${storedOAuthToken}`)

    if (await getIsTokenValid(storedOAuthToken)) {
      validAccessToken = storedOAuthToken
      console.info('token is still valid')
    } else {
      console.info('token has expired!')
      needsNewToken = true
    }
  } else {
    console.info('could not find an existing token')
    needsNewToken = true
  }

  if (needsNewToken) {
    const { accessToken, expiresIn } = await getNewOAuthTokenAndExpiry()
    validAccessToken = accessToken
    await storage.setItem(storageKeyOAuthToken, accessToken)

    const expiryAsUnixTimestampMs =
      Date.now() + convertMinutesToMilliseconds(expiresIn / 60)
    await storage.setItem(storageKeyOAuthTokenExpiryMs, expiryAsUnixTimestampMs)

    console.info(`using new token: ${validAccessToken}`)
    console.info(`expires in: ${expiryAsUnixTimestampMs}`)
  }

  isAuthenticated = true
  return true
}
module.exports.authenticate = authenticate

const getOAuthToken = () => validAccessToken
module.exports.getOAuthToken = getOAuthToken
