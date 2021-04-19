import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'

import useDatabaseQuery, {
  options,
  Operators,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useInfiniteDatabaseQuery from '../../hooks/useInfiniteDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import {
  CollectionNames,
  PhotoFieldNames,
  PhotoStatuses
} from '../../firestore'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import PhotoResults from '../../components/photo-results'
import BulkChangeAlbumForm from '../../components/bulk-change-album-form'
// import TogglePrivacyBtn from '../../components/toggle-privacy-btn'
// import ToggleIsAdult from '../../components/toggle-is-adult'
// import ToggleDeleteBtn from '../../components/toggle-delete-btn'

import { createRef } from '../../utils'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  controls: {
    padding: '0.5rem'
  },
  controlItems: {
    display: 'flex'
  },
  control: {
    marginRight: '0.25rem'
  },
  // TODO: make component
  scrollMessage: {
    padding: '2rem 0 0',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '150%',
    cursor: 'pointer'
  }
})

const Photos = ({
  showDeletedPhotos,
  isBulkEditing,
  selectedPhotoIds,
  onChangeId
}) => {
  const userId = useFirebaseUserId()
  const [
    isLoading,
    isError,
    results,
    isAtEndOfQuery,
    goToNextPage
  ] = useInfiniteDatabaseQuery(
    0,
    CollectionNames.Photos,
    [
      [
        PhotoFieldNames.createdBy,
        Operators.EQUALS,
        createRef(CollectionNames.Users, userId)
      ]
    ].concat(
      showDeletedPhotos
        ? []
        : [[PhotoFieldNames.status, Operators.EQUALS, PhotoStatuses.Active]]
    ),
    [PhotoFieldNames.createdAt, OrderDirections.DESC],
    true
  )
  const classes = useStyles()

  if (isError) {
    return <ErrorMessage>Failed to load photos</ErrorMessage>
  }

  return (
    <>
      <PhotoResults
        photos={results}
        isBulkEditing={isBulkEditing}
        selectedPhotoIds={selectedPhotoIds}
        onChangeId={onChangeId}
      />
      {isLoading ? (
        <LoadingIndicator message="Loading photos..." />
      ) : (
        <div className={classes.scrollMessage} onClick={goToNextPage}>
          {isAtEndOfQuery
            ? 'No more photos found'
            : 'Scroll or click here to load more photos'}
        </div>
      )}
    </>
  )
}

export default () => {
  const classes = useStyles()
  const [showDeletedPhotos, setShowDeletedPhotos] = useState(false)
  const [isBulkEditing, setIsBulkEditing] = useState(false)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([])

  const onChangeId = (photoId, newValue) =>
    setSelectedPhotoIds(currentIds => {
      if (currentIds.includes(photoId)) {
        return currentIds.filter(id => id !== photoId)
      } else {
        return currentIds.concat([photoId])
      }
    })

  return (
    <>
      <Helmet>
        <title>Browse my photos | VR Photo Buddy</title>
        <meta
          name="description"
          content={`Browse all of the photos that you have taken.`}
        />
      </Helmet>
      <div className={classes.root}>
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={showDeletedPhotos}
                onChange={() => setShowDeletedPhotos(currentVal => !currentVal)}
              />
            }
            label="Include deleted photos"
          />
        </FormControl>
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isBulkEditing}
                onChange={() => setIsBulkEditing(currentVal => !currentVal)}
              />
            }
            label="Bulk edit"
          />
        </FormControl>
        {isBulkEditing && (
          <div className={classes.controls}>
            <div className={classes.controlItems}>
              <div className={classes.control}>
                <BulkChangeAlbumForm
                  photoIds={selectedPhotoIds}
                  onDone={() => {
                    setIsBulkEditing(false)
                    setSelectedPhotoIds([])
                  }}
                />
              </div>
              {/* <div className={classes.control}>
                <TogglePrivacyBtn photoIds={selectedPhotoIds} />
              </div>
              <div className={classes.control}>
                <ToggleDeleteBtn photoIds={selectedPhotoIds} />
              </div>
              <div className={classes.control}>
                <ToggleIsAdult photoIds={selectedPhotoIds} />
              </div> */}
            </div>
          </div>
        )}
        <Photos
          showDeletedPhotos={showDeletedPhotos}
          isBulkEditing={isBulkEditing}
          selectedPhotoIds={selectedPhotoIds}
          onChangeId={onChangeId}
        />
      </div>
    </>
  )
}
