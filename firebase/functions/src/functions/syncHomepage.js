const functions = require('firebase-functions')
const { syncHomepage } = require('../homepage')

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await syncHomepage()
    res.status(200).send('Homepage has been synced')
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('failed-to-sync-homepage', err.message)
  }
})
