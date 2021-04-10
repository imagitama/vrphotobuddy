// const webp = require('webp-converter')
const os = require('os')
const path = require('path')
const { promises: fs } = require('fs')
const sharp = require('sharp')
const { callFunction, functionNames } = require('./firebase')
const { getOAuthToken, authenticate } = require('./auth')

const TEMP_DIR_NAME = 'vrphotobuddy'

const base64Encode = async (photoPath) => {
  // read binary data
  var bitmap = await fs.readFile(photoPath)

  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64')
}

const uploadPhotoBuffer = async (photoBuffer, filename) => {
  console.info(`encoding photo "${filename}"...`)

  // const base64EncodedPhoto = await base64Encode(photoPath)
  const base64EncodedPhoto = photoBuffer.toString('base64')

  console.info(`uploading photo "${filename}"...`)

  try {
    await callFunction(functionNames.uploadPhoto, {
      base64EncodedPhoto,
      oauthToken: getOAuthToken(),
      platform: 0, // 0 = VRChat, 1 = CVR, 2 = Neos
      filename,
    })
  } catch (err) {
    if (err.message.includes('OAuth token is invalid or has expired')) {
      await authenticate(true)
      await uploadPhotoBuffer(photoBuffer, filename)
      return
    }
    throw err
  }

  console.info(`photo has been uploaded successfully`)
}

const processPhoto = async (photoPath) => {
  console.info(`processing photo: ${photoPath}`)

  // TODO: Check if a panoramic photo from vrchat
  // TODO: Check if a PNG (user could dump whatever they want in that dir)

  const webpBuffer = await sharp(photoPath)
    .webp({
      quality: 100,
    })
    .toBuffer()

  console.info(`photo converted to webp`)

  await uploadPhotoBuffer(webpBuffer, path.basename(photoPath))
}
module.exports.processPhoto = processPhoto
