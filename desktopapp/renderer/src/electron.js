const electron = window.require('electron')

export function waitForNewPhotos(callback) {
  console.info('waiting for new photos in background')

  electron.ipcRenderer.on('new-photos', (event, photos) => {
    console.info(`main process has told us about ${photos.length} new photos`)
    callback(photos)
  })
}

export async function getPhotos() {
  return new Promise((resolve, reject) => {
    console.info('asking main process for photos')

    electron.ipcRenderer.on('get-photos-response', (event, photos) => {
      console.info(`main process found us ${photos.length} photos`)
      resolve(photos)
    })

    electron.ipcRenderer.send('get-photos')
  })
}

export async function uploadSelectedPhotos(photos) {
  return new Promise((resolve, reject) => {
    console.info(`telling main process to upload ${photos.length} photos...`)

    electron.ipcRenderer.on('upload-photos-response', (event, result) => {
      console.info('main process told us result of upload:', result)

      console.info(`result from main process for upload: ${result === true ? 'success' : 'failed!'}`)
      resolve()
    })

    electron.ipcRenderer.send('upload-photos', photos)
  })
}