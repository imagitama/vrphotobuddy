import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'

import useSearchTerm from '../../hooks/useSearchTerm'
import useDatabaseQuery, {
  options,
  OrderDirections
} from '../../hooks/useDatabaseQuery'

import { CollectionNames, PhotoFieldNames } from '../../firestore'
import PhotoResults from '../../components/photo-results'
import Button from '../../components/button'

const useStyles = makeStyles({
  title: {
    padding: '5rem 0 0',
    textAlign: 'center'
  },
  controls: {
    padding: '2.5rem',
    textAlign: 'center'
  }
})

export default () => {
  const classes = useStyles()
  const searchTerm = useSearchTerm()
  const [, , results] = useDatabaseQuery(CollectionNames.Photos, [], {
    [options.orderBy]: [PhotoFieldNames.createdAt, OrderDirections.DESC]
  })

  if (searchTerm) {
    return null
  }

  return (
    <div className={classes.root}>
      <h1 className={classes.title}>
        Automatically upload and tweet photos from VRChat, ChilloutVR and NeosVR
      </h1>
      <div className={classes.controls}>
        <Button size="large" icon={<GetAppIcon />} isDisabled>
          Download App
        </Button>
        <br />
        App is not available to download yet
      </div>
      {results && <PhotoResults photos={results} />}
    </div>
  )
}
