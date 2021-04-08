import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PhotoResultsItem from '../photo-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

export default ({ photos }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {photos.map(photo => (
        <PhotoResultsItem key={photo.id} photo={photo} />
      ))}
    </div>
  )
}
