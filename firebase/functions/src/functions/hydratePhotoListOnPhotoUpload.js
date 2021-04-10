const functions = require('firebase-functions')
const { CollectionNames } = require('../firebase')
const { hydratePhotoList } = require('../photos')

module.exports = functions.firestore
  .document(`${CollectionNames.Photos}/{id}`)
  .onCreate(async () => {
    await hydratePhotoList()
  })
