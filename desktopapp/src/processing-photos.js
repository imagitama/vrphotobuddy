let photosToProcess = []

module.exports.clearPhotosToProcess = () => {
    photosToProcess = []
}

module.exports.addPhotoToProcess = (photoPath) => {
    photosToProcess.push(photoPath)
    console.info(`now ${photosToProcess.length} to process`)
}

module.exports.getPhotosToProcess = () => photosToProcess