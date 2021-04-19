import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PhotoResultsItem from '../photo-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

export default ({
  photos,
  isBulkEditing = false,
  selectedPhotoIds = [],
  onChangeId
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {photos.map(photo => {
        const isSelected =
          selectedPhotoIds && selectedPhotoIds.includes(photo.id)
        return (
          <PhotoResultsItem
            key={photo.id}
            photo={photo}
            isBulkEditing={isBulkEditing}
            isSelected={isSelected}
            onChange={() => onChangeId(photo.id, !isSelected)}
          />
        )
      })}
    </div>
  )
}
