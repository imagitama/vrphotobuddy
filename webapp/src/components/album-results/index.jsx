import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AlbumResultsItem from '../album-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

export default ({ albums }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {albums.map(album => (
        <AlbumResultsItem key={album.id} album={album} />
      ))}
    </div>
  )
}
