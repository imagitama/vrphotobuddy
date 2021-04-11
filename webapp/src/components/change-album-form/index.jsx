import React, { useState } from 'react'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  options
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  CollectionNames,
  AlbumFieldNames,
  PhotoFieldNames
} from '../../firestore'
import { createRef } from '../../utils'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Dropdown from '../dropdown'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'

export default ({ photoId, existingAlbumRefs = [], onOpen, onClose }) => {
  const [, , user] = useUserRecord()
  const userId = useFirebaseUserId()
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

  const updateAlbumsForPhoto = async albumIdAddedOrRemoved => {
    try {
      // if (onSaveClick) {
      //   onSaveClick()
      // }

      const albums = existingAlbumRefs.find(
        ref => ref.id === albumIdAddedOrRemoved
      )
        ? existingAlbumRefs
            .filter(ref => ref.id !== albumIdAddedOrRemoved)
            .map(({ id }) => createRef(CollectionNames.Albums, id))
        : existingAlbumRefs
            .map(({ id }) => createRef(CollectionNames.Albums, id))
            .concat([createRef(CollectionNames.Albums, albumIdAddedOrRemoved)])

      await save({
        [PhotoFieldNames.albums]: albums,
        [PhotoFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [PhotoFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save photo to database', err)
      handleError(err)
    }
  }

  if (isLoadingAlbums || !albumsForUser) {
    return <LoadingIndicator message="Loading albums..." />
  }

  if (isErrorLoadingAlbums) {
    return <ErrorMessage>Failed to load albums</ErrorMessage>
  }

  return (
    <Dropdown
      label={isSaving ? 'Saving...' : `Change Albums`}
      selectedValues={existingAlbumRefs.map(albumRef => albumRef.id)}
      onClickWithValue={albumId => updateAlbumsForPhoto(albumId)}
      options={albumsForUser.map(albumForUser => ({
        label: albumForUser[AlbumFieldNames.title],
        value: albumForUser.id
      }))}
      onOpen={onOpen}
      onClose={onClose}
    />
  )
}
