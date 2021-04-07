const functions = require('firebase-functions')
const { db, CollectionNames, PhotoFieldNames } = require('../firebase')
const { getIsOauthTokenValid } = require('../oauth')

module.exports = functions.https.onCall(async (data) => {
  try {
    const { base64EncodedPhoto, oauthToken } = data

    if (!oauthToken) {
      throw new Error('No OAuth token provided')
    }

    if (!base64EncodedPhoto) {
      throw new Error('No photo provided')
    }

    if (!(await getIsOauthTokenValid(oauthToken))) {
      throw new Error('OAuth token is invalid or has expired')
    }

    // TODO: Decode base64 and write to bucket for better performance
    await db.collection(CollectionNames.Photos).add({
      [PhotoFieldNames.sourceUrl]: `data:image/webp;base64,${base64EncodedPhoto}`,
    })

    return { success: false }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
