const { app, Menu, Tray } = require('electron')
const path = require('path')
const log = require('electron-log')

Object.assign(console, log.functions)

// prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('only one instance of electron is allowed - closing')
  app.quit()
}

let tray = null
app.whenReady().then(() => {
  tray = new Tray(path.resolve(app.getAppPath(), 'resources/icon.png'))

  let contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true
        app.quit()
      },
    },
  ])

  tray.setToolTip('VR Photo Buddy')
  tray.setContextMenu(contextMenu)

  tray.on('right-click', () => {
    tray.popUpContextMenu()
  })
})
