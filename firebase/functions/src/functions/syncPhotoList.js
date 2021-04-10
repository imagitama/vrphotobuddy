const functions = require('firebase-functions')
const { hydratePhotoList } = require('../photos')

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await hydratePhotoList()
    res.status(200).send('Synced!')
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
