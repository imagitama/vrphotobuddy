const { app, Menu, Tray } = require('electron')
const path = require('path')
const log = require('electron-log')

Object.assign(console, log.functions)

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
