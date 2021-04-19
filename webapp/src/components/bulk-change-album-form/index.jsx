import React, { useState } from 'react'
import PhotoAlbumIcon from '@material-ui/icons/PhotoAlbum'
import firebase from 'firebase/app'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  options
} from '../../hooks/useDatabaseQuery'
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

export async function bulkAddAlbum(ids, albumIdToAdd, userId) {
  const db = firebase.firestore()
  const albumToAddRef = db.collection(CollectionNames.Albums).doc(albumIdToAdd)

  return firebase.firestore().runTransaction(async transaction =>
    Promise.all(
      ids.map(async id => {
        const docRef = firebase
          .firestore()
          .collection(CollectionNames.Photos)
          .doc(id)
        const doc = await transaction.get(docRef)
        const existingAlbumRefs = doc.get(PhotoFieldNames.albums) || []

        // if it does not exist already, add...
        if (!existingAlbumRefs.find(albumRef => albumRef.id === albumIdToAdd)) {
          transaction.update(docRef, {
            [PhotoFieldNames.albums]: existingAlbumRefs.concat([albumToAddRef]),
            [PhotoFieldNames.lastModifiedAt]: new Date(),
            [PhotoFieldNames.lastModifiedBy]: db
              .collection(CollectionNames.Users)
              .doc(userId)
          })
        }
      })
    )
  )
}

export async function bulkRemoveAlbum(ids, albumIdToRemove, userId) {
  const db = firebase.firestore()
  return db.runTransaction(async transaction =>
    Promise.all(
      ids.map(async id => {
        const docRef = firebase
          .firestore()
          .collection(CollectionNames.Photos)
          .doc(id)
        const doc = await transaction.get(docRef)
        const existingAlbumRefs = doc.get(PhotoFieldNames.albums) || []

        // if it exists already, remove...
        if (
          existingAlbumRefs.find(albumRef => albumRef.id === albumIdToRemove)
        ) {
          transaction.update(docRef, {
            [PhotoFieldNames.albums]: existingAlbumRefs.filter(
              albumRef => albumRef.id !== albumIdToRemove
            ),
            [PhotoFieldNames.lastModifiedAt]: new Date(),
            [PhotoFieldNames.lastModifiedBy]: db
              .collection(CollectionNames.Users)
              .doc(userId)
          })
        }
      })
    )
  )
}

export default ({
  photoIds = null,
  onOpen,
  onClose,
  onDone,
  hideLabel = false
}) => {
  const [, , user] = useUserRecord()
  const userId = useFirebaseUserId()
  const [isSaving, setIsSaving] = useState(false)
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
  const [isAdding, setIsAdding] = useState(true)

  const updateAlbumsForPhotos = async albumId => {
    try {
      // on click 1st option
      if (!albumId) {
        setIsAdding(currentVal => !currentVal)
        return
      }

      setIsSaving(true)

      if (isAdding) {
        await bulkAddAlbum(photoIds, albumId, userId)
      } else {
        await bulkRemoveAlbum(photoIds, albumId, userId)
      }

      setIsSaving(false)

      onDone()
    } catch (err) {
      console.error('Failed to save photos to database', err)
      handleError(err)
      setIsSaving(false)
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
      label={
        hideLabel ? (
          <PhotoAlbumIcon />
        ) : isSaving ? (
          'Saving...'
        ) : (
          `Change Albums (${photoIds.length})`
        )
      }
      selectedValues={[]}
      onClickWithValue={albumId => updateAlbumsForPhotos(albumId)}
      options={[
        {
          label: 'Should add albums to these photos?',
          isSelected: isAdding
        }
      ].concat(
        albumsForUser.map(albumForUser => ({
          label: albumForUser[AlbumFieldNames.title],
          value: albumForUser.id
        }))
      )}
      onOpen={onOpen}
      onClose={onClose}
    />
  )
}
