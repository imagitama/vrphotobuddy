import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  options,
  Operators
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { CollectionNames, AlbumFieldNames } from '../../firestore'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import AlbumResults from '../../components/album-results'
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

const Albums = () => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Albums,
    [
      [
        AlbumFieldNames.createdBy,
        Operators.EQUALS,
        createRef(CollectionNames.Users, userId)
      ]
    ],
    { [options.populateRefs]: true }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading albums..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load albums</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No albums found</NoResultsMessage>
  }

  return <AlbumResults albums={results} />
}

export default () => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Albums />
    </div>
  )
}
