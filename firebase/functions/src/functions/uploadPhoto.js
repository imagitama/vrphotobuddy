const functions = require('firebase-functions')
const { getIsOauthTokenValid, getUserRefFromOAuthToken } = require('../oauth')
const { insertPhoto } = require('../photos')

module.exports = functions.https.onCall(async (data) => {
  try {
    const { base64EncodedPhoto, oauthToken, platform, filename } = data

    if (!oauthToken) {
      throw new Error('No OAuth token provided')
    }

    if (!base64EncodedPhoto) {
      throw new Error('No photo provided')
    }

    if (!(await getIsOauthTokenValid(oauthToken))) {
      throw new Error('OAuth token is invalid or has expired')
    }

    await insertPhoto(
      base64EncodedPhoto,
      await getUserRefFromOAuthToken(oauthToken),
      platform,
      filename
    )

    return { success: false }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
