import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useSearchTerm from '../../hooks/useSearchTerm'
import useDatabaseQuery from '../../hooks/useDatabaseQuery'

import { CollectionNames } from '../../firestore'

const useStyles = makeStyles({})

export default () => {
  const classes = useStyles()
  const searchTerm = useSearchTerm()
  const [isLoading, isError, results] = useDatabaseQuery(CollectionNames.Photos)

  if (searchTerm) {
    return null
  }

  return (
    <div className={classes.root}>
      <div className={classes.mainContent}>
        <h1 className={classes.title}>
          Automatically upload and tweet photos from VRChat, ChilloutVR and
          NeosVR
        </h1>
        <h2>Recent photos</h2>
        {results && results.length ? (
          <ul>
            {results.map(result => (
              <a href={result.sourceUrl} target="_blank">
                <img src={result.sourceUrl} width={300} />
              </a>
            ))}
          </ul>
        ) : (
          'No photos found'
        )}
      </div>
    </div>
  )
}
