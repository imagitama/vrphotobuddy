const sharp = require('sharp')
const { promises: fs } = require('fs')
const os = require('os')
const path = require('path')
const admin = require('firebase-admin')
const {
  db,
  CollectionNames,
  PhotoFieldNames,
  PhotoStatuses,
  PhotoPrivacies,
  OrderDirections,
} = require('./firebase')

const convertBase64EncodedPhotoToBuffer = (base64EncodedPhoto) =>
  new Buffer(base64EncodedPhoto, 'base64')

const savePhotoToBucket = async (photoBuffer, filename, userId) => {
  const bucket = admin.storage().bucket()

  const newFilePath = `photos/${userId}/${filename}`

  console.info(`Uploading file to bucket: ${newFilePath}`)

  const tempPath = path.resolve(os.tmpdir(), filename)

  console.info(`saving to temp location: ${tempPath}`)

  await fs.writeFile(tempPath, photoBuffer)

  await bucket.upload(tempPath, {
    destination: newFilePath,
    resumable: false, // fix weird ResumableUploadError error
  })

  const destFile = bucket.file(newFilePath)

  const metadata = await destFile.getMetadata()
  const downloadUrl = metadata[0].mediaLink

  console.info(`File has been uploaded with URL: ${downloadUrl}`)

  return downloadUrl
}

const resizeAndSavePhoto = async (
  photoBuffer,
  newWidth,
  newHeight,
  filename,
  userId
) => {
  console.info(
    `resizing and saving photo ${filename} to ${newWidth}/${newHeight}`
  )

  const resizedBuffer = await sharp(photoBuffer)
    .resize(newWidth, newHeight)
    .toBuffer()

  console.info(`resize complete`)

  return savePhotoToBucket(resizedBuffer, filename, userId)
}

const sizes = [
  [PhotoFieldNames.sourceUrl, 'source', 1920, 1080],
  [PhotoFieldNames.largeUrl, 'large', 1280, 720],
  [PhotoFieldNames.mediumUrl, 'medium', 640, 360],
  [PhotoFieldNames.smallUrl, 'small', 480, 270],
]

const insertPhoto = async (
  base64EncodedPhoto,
  createdByRef,
  platform,
  filename,
  dateOriginalFileCreated
) => {
  console.info(
    `inserting photo by ${createdByRef.id} platform ${platform} filename "${filename}" created at "${dateOriginalFileCreated}"`
  )

  const originalPhotoBuffer = convertBase64EncodedPhotoToBuffer(
    base64EncodedPhoto
  )

  const fields = {}

  for (const [fieldName, suffix, width, height] of sizes) {
    const url = await resizeAndSavePhoto(
      originalPhotoBuffer,
      width,
      height,
      `${filename.replace('.png', '')}_${suffix}.webp`,
      createdByRef.id
    )
    fields[fieldName] = url
  }

  const createdDoc = await db.collection(CollectionNames.Photos).add({
    [PhotoFieldNames.sourceUrl]: fields[PhotoFieldNames.sourceUrl],
    [PhotoFieldNames.largeUrl]: fields[PhotoFieldNames.largeUrl],
    [PhotoFieldNames.mediumUrl]: fields[PhotoFieldNames.mediumUrl],
    [PhotoFieldNames.smallUrl]: fields[PhotoFieldNames.smallUrl],
    [PhotoFieldNames.title]: '',
    [PhotoFieldNames.description]: '',
    [PhotoFieldNames.status]: PhotoStatuses.Active,
    [PhotoFieldNames.privacy]: PhotoPrivacies.Public,
    [PhotoFieldNames.albums]: [],
    [PhotoFieldNames.isAdult]: false,
    [PhotoFieldNames.tags]: [],
    [PhotoFieldNames.originallyCreatedAt]: dateOriginalFileCreated,
    [PhotoFieldNames.platform]: platform,
    [PhotoFieldNames.createdAt]: new Date(),
    [PhotoFieldNames.createdBy]: createdByRef,
  })

  return createdDoc.id
}
module.exports.insertPhoto = insertPhoto

const hydratePhotoList = async () => {
  console.debug('hydrating photo list...')

  // TODO: Only get public and non deleted photos
  const { docs: allPhotos } = await db
    .collection(CollectionNames.Photos)
    .orderBy(PhotoFieldNames.createdAt, OrderDirections.DESC)
    .get()

  const ids = allPhotos.map((photo) => photo.id)

  console.debug(`found ${ids.length} photo ids`)

  await db.collection(CollectionNames.Special).doc('all-photo-ids').set({
    ids,
  })
}
module.exports.hydratePhotoList = hydratePhotoList
