const { app, Menu, Tray, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const log = require('electron-log')
const child_process = require('child_process')
const { addListener } = require('./status')
const { setItem, keys } = require('./storage')
const { processPhotos } = require('./photo')

Object.assign(console, log.functions)

const openFile = (path) => {
  console.info(`opening file ${path}`)
  child_process.exec(`start ${path}`)
}

// prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('only one instance of electron is allowed - closing')
  app.quit()
}

let tray = null
app.whenReady().then(() => {
  tray = new Tray(
    path.resolve(
      app.getAppPath(),
      process.env.NODE_ENV === 'development' ? '..' : '.',
      'resources/icon.png'
    )
  )

  const createContextMenu = (statusText) => {
    return Menu.buildFromTemplate([
      {
        label: statusText || 'Waiting',
      },
      {
        label: 'Logs...',
        click: () => {
          openFile(log.transports.file.file)
        },
      },
      {
        label: 'Quit',
        click: () => {
          app.isQuiting = true
          app.quit()
        },
      },
    ])
  }

  tray.setToolTip(`VR Photo Buddy ${require('../package.json').version}`)
  tray.setContextMenu(createContextMenu())

  addListener((newStatusText) => {
    tray.setContextMenu(createContextMenu(newStatusText))
  })

  tray.on('right-click', () => {
    tray.popUpContextMenu()
  })
})

const onQuit = async () => {
  console.info('quit detected - storing last known time')
  await setItem(keys.lastKnownTime, Date.now())
}

app.on('before-quit', onQuit)
app.on('will-quit', onQuit)
process.on('exit', onQuit)

app.on('window-all-closed', (e) => {
  console.info('all renderer windows have been closed')
  e.preventDefault()
})

let dialogWindow

module.exports.showDialog = async (photos) => {
  if (dialogWindow) {
    console.info(`tried to show dialog but it is already visible, telling it about ${photos.length} new photos...`)
    dialogWindow.webContents.send('new-photos', photos)
    return
  }

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
  const actualPath = process.env.NODE_ENV === 'development' ? path.resolve(app.getAppPath(), pathToIndexInRoot) : path.resolve(__dirname, '..', pathToIndexInRoot)

  console.info(`loading html file: ${actualPath}`)

  dialogWindow.loadFile(
    actualPath
  )

  ipcMain.on('get-photos', (event) => {
    console.info(`renderer asked for photos - sending ${photos.length} photo paths`)
    event.sender.send('get-photos-response', photos)
  })

  ipcMain.on('upload-photos', async (event, photos) => {
    console.info(`renderer wants to upload ${photos.length} photos`)

    try {
      await processPhotos(photos)

      event.sender.send('upload-photos-response', true)
    } catch (err) {
      event.sender.send('upload-photos-response', false)
      throw err
    }
  })
}
