// const webp = require('webp-converter')
const os = require('os')
const path = require('path')
const { promises: fs } = require('fs')
const sharp = require('sharp')
const { callFunction, functionNames } = require('./firebase')
const { getOAuthToken, authenticate } = require('./auth')
const { getConfig } = require('./config')
const { getItem, setItem, keys } = require('./storage')
const { setStatus } = require('./status')

const storageKeyKnownPhotoFilenames = 'known-photo-filenames'

const uploadPhotoBuffer = async (
  photoBuffer,
  filename,
  dateOriginalFileCreated
) => {
  console.info(`encoding photo "${filename}"...`)

  setStatus(`Uploading photo "${filename}"...`)

  // const base64EncodedPhoto = await base64Encode(photoPath)
  const base64EncodedPhoto = photoBuffer.toString('base64')

  console.info(`uploading photo "${filename}"...`)

  try {
    const {
      data: { photoId },
    } = await callFunction(functionNames.uploadPhoto, {
      base64EncodedPhoto,
      oauthToken: getOAuthToken(),
      platform: 0, // 0 = VRChat, 1 = CVR, 2 = Neos
      filename,
      originalFileCreatedMs: dateOriginalFileCreated.getTime(),
    })

    console.info(`photo ID: ${photoId}`)
  } catch (err) {
    console.error(`Failed to upload photo: ${err.message}`)

    if (err.message.includes('OAuth token is invalid or has expired')) {
      console.info(
        'oauth token invalid/expired so forcing a new token and trying upload again...'
      )
      await authenticate(true)
      await uploadPhotoBuffer(photoBuffer, filename, dateOriginalFileCreated)
      return
    }
    throw err
  }

  setStatus('Photo uploaded successfully')

  console.info(`photo has been uploaded successfully`)
}

const processPhoto = async (photoPath) => {
  console.info(`processing photo: ${photoPath}`)

  const fileName = path.basename(photoPath)

  setStatus(`Processing photo "${fileName}"...`)

  // TODO: Check if a panoramic photo from vrchat
  // TODO: Check if a PNG (user could dump whatever they want in that dir)

  const { birthtime } = await fs.stat(photoPath)

  const webpBuffer = await sharp(photoPath)
    .webp({
      quality: 100,
    })
    .toBuffer()

  console.info(`photo converted to webp`)

  await uploadPhotoBuffer(webpBuffer, fileName, birthtime)
}
module.exports.processPhoto = processPhoto

const processUnprocessedPhotos = async () => {
  console.info('processing unprocessed photos...')

  // const storedLastKnownTime = await getItem(keys.lastKnownTime)
  const storedLastKnownTime = Date.now()

  if (!storedLastKnownTime) {
    console.info('last known time not set, skipping...')
    return
  }

  const lastKnownTime = new Date(storedLastKnownTime)

  console.info(`last known time: ${lastKnownTime}`)

  const pathOfPhotos = await getConfig().PATH_TO_VRCHAT_PHOTOS

  const photoFilenamesOnDisk = await fs.readdir(pathOfPhotos)

  const photoPathsToProcess = []

  console.info(`found ${photoFilenamesOnDisk.length} photos`)

  for (const photoFilenameOnDisk of photoFilenamesOnDisk) {
    const fullPath = path.resolve(pathOfPhotos, photoFilenameOnDisk)

    const { birthtime } = await fs.stat(fullPath)

    if (birthtime > lastKnownTime) {
      photoPathsToProcess.push(fullPath)
    }
  }

  if (photoPathsToProcess.length) {
    console.info(
      `found ${photoPathsToProcess.length} photos that we don't know about and we need to process (first one is "${photoPathsToProcess[0]}")`
    )

    for (const photoPathOnDisk of photoPathsToProcess) {
      await processPhoto(photoPathOnDisk)
    }
  } else {
    console.info('could not find any new unprocessed photos, skipping...')
  }

  console.info(`finished processing all unprocessed photos`)
}
module.exports.processUnprocessedPhotos = processUnprocessedPhotos

const processPhotos = async (photoPaths) => {
  console.info(`processing ${photoPaths.length}...`)
  await Promise.all(photoPaths.map(async path => await processPhoto(path)))
  console.info(`${photoPaths.length} photos have been processed`)
}
module.exports.processPhotos = processPhotos