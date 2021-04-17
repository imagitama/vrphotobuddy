const { app, Menu, Tray, powerMonitor } = require('electron')
const path = require('path')
const log = require('electron-log')
const child_process = require('child_process')
const { addListener } = require('./status')
const { setItem, keys } = require('./storage')

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
