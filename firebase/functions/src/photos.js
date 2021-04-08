const {
  db,
  CollectionNames,
  PhotoFieldNames,
  PhotoStatuses,
  PhotoPrivacies,
} = require('./firebase')

const insertPhoto = async (base64EncodedPhoto, createdByRef) => {
  // TODO: Decode base64 and write to bucket for better performance OR try and POST the file
  await db.collection(CollectionNames.Photos).add({
    [PhotoFieldNames.sourceUrl]: `data:image/webp;base64,${base64EncodedPhoto}`,
    // TODO: Do this in function or desktop app?
    [PhotoFieldNames.largeUrl]: '',
    [PhotoFieldNames.mediumUrl]: '',
    [PhotoFieldNames.smallUrl]: '',
    [PhotoFieldNames.title]: '',
    [PhotoFieldNames.description]: '',
    [PhotoFieldNames.status]: PhotoStatuses.Active,
    [PhotoFieldNames.privacy]: PhotoPrivacies.Public,
    [PhotoFieldNames.album]: null,
    [PhotoFieldNames.isAdult]: false,
    [PhotoFieldNames.tags]: [],
    [PhotoFieldNames.createdAt]: new Date(),
    [PhotoFieldNames.createdBy]: createdByRef,
  })
}
module.exports.insertPhoto = insertPhoto
