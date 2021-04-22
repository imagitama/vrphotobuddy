const { BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { processPhotos } = require('./photo')
const { clearPhotosToProcess, getPhotosToProcess } = require('./processing-photos')

let dialogWindow

module.exports.setup = () => {
    ipcMain.on('get-photos', (event) => {
        const photos = getPhotosToProcess()
        console.info(`renderer asked for photos - sending ${photos.length} photo paths`)
        event.sender.send('get-photos-response', photos)
    })

    ipcMain.on('upload-photos', async (event, photos) => {
        console.info(`renderer wants to upload ${photos.length} photos`)

        try {
            await processPhotos(photos)

            clearPhotosToProcess()

            event.sender.send('upload-photos-response', true)
        } catch (err) {
            event.sender.send('upload-photos-response', false)
            throw err
        }
    })
}

const showDialog = async () => {
    if (dialogWindow) {
        const photos = getPhotosToProcess()
        console.info(`tried to show dialog but it is already visible, telling it about ${photos.length} new photos...`)
        givePhotosToDialog(photos)
        return
    }

    console.info('showing dialog...')

    dialogWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        movable: true,
        show: true,
        webPreferences: {
            nodeIntegration: true
        }
    })

    dialogWindow.on('close', () => {
        dialogWindow = null
    })

    const pathToIndexInRoot = 'renderer/build/index.html'
    const actualPath = path.resolve(__dirname, '..', pathToIndexInRoot)

    console.info(`loading html file: ${actualPath}`)

    dialogWindow.loadFile(
        actualPath
    )
}
module.exports.showDialog = showDialog

const givePhotosToDialog = (photoPaths) => {
    if (!dialogWindow) {
        return
    }
    dialogWindow.webContents.send('new-photos', photoPaths)
}
module.exports.givePhotosToDialog = givePhotosToDialog