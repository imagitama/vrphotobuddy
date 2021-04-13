// const webp = require('webp-converter')
const os = require('os')
const path = require('path')
const { promises: fs } = require('fs')
const sharp = require('sharp')
const { callFunction, functionNames } = require('./firebase')
const { getOAuthToken, authenticate } = require('./auth')
const { getConfig } = require('./config')
const { getItem, setItem } = require('./storage')
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

  await saveKnownPhotoPath(photoPath)
}
module.exports.processPhoto = processPhoto

const saveKnownPhotoPath = async (photoPath) => {
  let knownPhotoFilenamesJson = await getItem(storageKeyKnownPhotoFilenames)

  if (!knownPhotoFilenamesJson) {
    knownPhotoFilenamesJson = '[]'
  }

  const knownPhotoFilenames = JSON.parse(knownPhotoFilenamesJson)

  const newKnownPhotoFilenames = knownPhotoFilenames.concat([photoPath])

  await setItem(
    storageKeyKnownPhotoFilenames,
    JSON.stringify(newKnownPhotoFilenames)
  )
}

const processUnprocessedPhotos = async () => {
  console.info('processing unprocessed photos...')

  const knownPhotoFilenamesJson = await getItem(storageKeyKnownPhotoFilenames)

  if (!knownPhotoFilenamesJson) {
    console.info('no known photo filenames (no json), skipping...')
    return
  }

  const knownPhotoFilenames = JSON.parse(knownPhotoFilenamesJson)

  if (!knownPhotoFilenames.length) {
    console.info('no known photo filenames (empty), skipping...')
    return
  }

  console.info(
    `found ${knownPhotoFilenames.length} known photo filenames (first one is "${knownPhotoFilenames[0]}")`
  )

  const pathOfPhotos = await getConfig().PATH_TO_VRCHAT_PHOTOS

  const photoFilenamesOnDisk = await fs.readdir(pathOfPhotos)

  const photoPathsToProcess = []

  for (const photoFilenameOnDisk of photoFilenamesOnDisk) {
    const fullPath = path.resolve(pathOfPhotos, photoFilenameOnDisk)

    if (!knownPhotoFilenames.includes(fullPath)) {
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
