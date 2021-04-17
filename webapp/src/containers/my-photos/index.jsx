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
import { createRef } from '../../utils'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0
  }
})

const Photos = ({ showDeletedPhotos }) => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, results] = useDatabaseQuery(
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
    {
      [options.populateRefs]: false,
      [options.orderBy]: [PhotoFieldNames.createdAt, OrderDirections.DESC],
      [options.subscribe]: true
    }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading your photos..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load photos</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No photos found</NoResultsMessage>
  }

  return <PhotoResults photos={results} />
}

export default () => {
  const classes = useStyles()
  const [showDeletedPhotos, setShowDeletedPhotos] = useState(false)

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
        <Photos showDeletedPhotos={showDeletedPhotos} />
      </div>
    </>
  )
}
