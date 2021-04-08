import React, { useState } from 'react'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  options
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, AlbumFieldNames } from '../../firestore'
import { createRef } from '../../utils'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Dropdown from '../dropdown'

export default ({ photoId, existingAlbumRefs }) => {
  const [, , user] = useUserRecord()
  const [
    isLoadingAlbums,
    isErrorLoadingAlbums,
    albumsForUser
  ] = useDatabaseQuery(
    CollectionNames.Albums,
    user
      ? [
          [
            AlbumFieldNames.createdBy,
            Operators.EQUALS,
            createRef(CollectionNames.Users, user.id)
          ]
        ]
      : false,
    {
      [options.populateRefs]: false
    }
  )
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Photos,
    photoId
  )
  const [newAlbumIds, setNewAlbumIds] = useState([])

  const updateAlbumsForPhoto = async () => {}

  if (isLoadingAlbums || !albumsForUser) {
    return <LoadingIndicator message="Loading albums..." />
  }

  if (isErrorLoadingAlbums) {
    return <ErrorMessage>Failed to load albums</ErrorMessage>
  }

  return (
    <Dropdown
      label="Change Albums"
      selectedValues={existingAlbumRefs.map(albumRef => albumRef.id)}
      onClickWithValue={albumId => updateAlbumsForPhoto(albumId)}
      options={albumsForUser.map(albumForUser => ({
        label: albumForUser[AlbumFieldNames.title],
        value: albumForUser.id
      }))}
    />
  )
}
