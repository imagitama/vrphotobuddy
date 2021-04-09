import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  options,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import { CollectionNames, PhotoFieldNames } from '../../firestore'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import PhotoResults from '../../components/photo-results'

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
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Photos,
    undefined,
    {
      [options.populateRefs]: true,
      [options.orderBy]: [PhotoFieldNames.createdAt, OrderDirections.DESC]
    }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading photos..." />
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
