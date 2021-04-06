import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useSearchTerm from '../../hooks/useSearchTerm'

const useStyles = makeStyles({})

export default () => {
  const classes = useStyles()
  const searchTerm = useSearchTerm()

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
      </div>
    </div>
  )
}
