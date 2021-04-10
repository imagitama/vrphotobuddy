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
  filename
) => {
  console.info(
    `inserting photo by ${createdByRef.id} platform ${platform} filename "${filename}"`
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

  // TODO: Decode base64 and write to bucket for better performance OR try and POST the file
  await db.collection(CollectionNames.Photos).add({
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
    [PhotoFieldNames.platform]: platform,
    [PhotoFieldNames.createdAt]: new Date(),
    [PhotoFieldNames.createdBy]: createdByRef,
  })
}
module.exports.insertPhoto = insertPhoto
