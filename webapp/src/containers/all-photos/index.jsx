import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

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
  },
  scrollMessage: {
    padding: '2rem 0 0',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '150%'
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
  const classes = useStyles()

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
        <div className={classes.scrollMessage}>
          {isAtEndOfQuery
            ? 'No more photos found'
            : 'Scroll to load more photos'}
        </div>
      )}
    </>
  )
}

export default () => {
  const classes = useStyles()

  return (
    <>
      <Helmet>
        <title>Browse all photos | VR Photo Buddy</title>
        <meta
          name="description"
          content={`Browse all of the photos that the users of the site have taken.`}
        />
      </Helmet>
      <div className={classes.root}>
        <Photos />
      </div>
    </>
  )
}
