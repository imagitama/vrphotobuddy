import React from 'react'
import PhotoAlbumIcon from '@material-ui/icons/PhotoAlbum'
import PhotoIcon from '@material-ui/icons/Photo'
import * as routes from './routes'
import { UserFieldNames } from './firestore'

export function canShowMenuItem(menuItem, user) {
  if (menuItem.requiresAuth && !user) {
    return false
  }
  if (menuItem.requiresNotAuth && user) {
    return false
  }
  if (menuItem.requiresEditor && (!user || user.isEditor !== true)) {
    return false
  }
  if (menuItem.requiresAdmin && (!user || user.isAdmin !== true)) {
    return false
  }
  if (menuItem.requiresAdminOrEditor) {
    if (!user) {
      return false
    }
    if (user.isAdmin || user.isEditor) {
      return true
    }
    return false
  }
  if (menuItem.requiresAdultContentEnabled) {
    if (!user) {
      return false
    }
    if (user[UserFieldNames.enabledAdultContent]) {
      return true
    }
    return false
  }
  return true
}

export function getLabelForMenuItem(Label) {
  if (typeof Label === 'string') {
    return Label
  }
  return <Label />
}

export default [
  {
    id: 'photos',
    label: 'All Photos',
    url: routes.allPhotos,
    icon: PhotoIcon
  },
  {
    id: 'albums',
    label: 'All Albums',
    url: routes.allAlbums,
    icon: PhotoAlbumIcon
  },
  {
    id: 'my-photos',
    label: 'My Photos',
    url: routes.myPhotos,
    icon: PhotoIcon
  },
  {
    id: 'my-albums',
    label: 'My Albums',
    url: routes.myAlbums,
    icon: PhotoAlbumIcon
  }
]
