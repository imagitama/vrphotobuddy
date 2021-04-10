import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  options,
  Operators,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { CollectionNames, PhotoFieldNames } from '../../firestore'

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

const Photos = () => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Photos,
    [
      [
        PhotoFieldNames.createdBy,
        Operators.EQUALS,
        createRef(CollectionNames.Users, userId)
      ]
    ],
    {
      [options.populateRefs]: true,
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

  return (
    <div className={classes.root}>
      <Photos />
    </div>
  )
}
