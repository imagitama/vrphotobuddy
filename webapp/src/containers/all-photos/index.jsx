import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { OrderDirections } from '../../hooks/useDatabaseQuery'
import useInfiniteDatabaseQuery from '../../hooks/useInfiniteDatabaseQuery'
import { CollectionNames, PhotoFieldNames } from '../../firestore'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import PhotoResults from '../../components/photo-results'
import Message, { styles } from '../../components/message'

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
  const [
    isLoading,
    isError,
    results,
    isAtEndOfQuery
  ] = useInfiniteDatabaseQuery(0, CollectionNames.Photos, undefined, [
    PhotoFieldNames.createdAt,
    OrderDirections.DESC
  ])

  // if (isLoading || !results) {
  //   return <LoadingIndicator message="Loading photos..." />
  // }

  if (isError) {
    return <ErrorMessage>Failed to load photos</ErrorMessage>
  }

  // if (!results.length) {
  //   return <NoResultsMessage>No photos found</NoResultsMessage>
  // }

  return (
    <>
      <PhotoResults photos={results} />
      {isLoading ? (
        <LoadingIndicator message="Loading photos..." />
      ) : (
        <Message style={styles.BG}>
          {isAtEndOfQuery
            ? 'No more photos found'
            : 'Scroll to load more photos'}
        </Message>
      )}
    </>
  )
}

export default () => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Photos />
    </div>
  )
}
