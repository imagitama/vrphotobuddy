const functions = require('firebase-functions')
// const admin = require('firebase-admin')
const fetch = require('node-fetch')
// const { URLSearchParams } = require('url')
const config = require('../config')

const TWITTER_OAUTH_CALLBACK_URL =
  config.twitter.callback_url || 'http://localhost:3000/login'

//   const twitterSignIn = require('twittersignin')({
//     consumerKey: process.env.TWITTER_CONSUMER_KEY,
//     consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//     accessToken: process.env.TWITTER_ACCESS_TOKEN,
//     accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
// });

const getRequestToken = async () => {
  console.debug('get request token', TWITTER_OAUTH_CALLBACK_URL)

  const resp = await fetch(`https://api.twitter.com/oauth/request_token`, {
    method: 'POST',
    headers: {
      Authorization: `OAuth oauth_callback="${encodeURI(
        TWITTER_OAUTH_CALLBACK_URL
      )}"`,
    },
  })

  if (!resp.ok) {
    const body = await resp.text()

    throw new Error(
      `Cannot get request token: ${resp.status} ${resp.statusText} ${body}`
    )
  }

  const { oauth_token } = await resp.json()

  console.debug('got request token', oauth_token)

  return oauth_token
}

module.exports = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth.uid) {
      throw new Error('Need to be logged in')
    }

    const requestToken = await getRequestToken()

    return { requestToken }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
