import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'
import { Helmet } from 'react-helmet'

import useSearchTerm from '../../hooks/useSearchTerm'
import useDatabaseQuery, {
  options,
  OrderDirections,
  Operators
} from '../../hooks/useDatabaseQuery'

import {
  CollectionNames,
  PhotoFieldNames,
  PhotoPrivacies,
  PhotoStatuses
} from '../../firestore'
import PhotoResults from '../../components/photo-results'
import Button from '../../components/button'
import * as routes from '../../routes'

const useStyles = makeStyles({
  title: {
    padding: '5rem 0 0',
    textAlign: 'center'
  },
  betaMessage: {
    fontSize: '150%',
    padding: '2.5rem',
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
  const [, , results] = useDatabaseQuery(
    CollectionNames.Photos,
    [
      [PhotoFieldNames.privacy, Operators.EQUALS, PhotoPrivacies.Public],
      [PhotoFieldNames.status, Operators.EQUALS, PhotoStatuses.Active]
    ],
    {
      [options.populateRefs]: false,
      [options.orderBy]: [PhotoFieldNames.createdAt, OrderDirections.DESC],
      [options.limit]: 5,
      [options.subscribe]: true
    }
  )

  if (searchTerm) {
    return null
  }

  return (
    <>
      <Helmet>
        <title>{`Automatically upload and tweet photos from VRChat, ChilloutVR and NeosVR | VR Photo Buddy`}</title>
        <meta
          name="description"
          content={`Automatically upload and tweet photos from VRChat, ChilloutVR and NeosVR.`}
        />
        <meta property="og:title" content="VR Photo Buddy" />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={`Automatically upload and tweet photos from VRChat, ChilloutVR and NeosVR.`}
        />
        <meta property="og:url" content={routes.home} />
        <meta property="og:site_name" content="VR Photo Buddy" />
      </Helmet>
      <div className={classes.root}>
        <h1 className={classes.title}>
          Automatically upload and tweet photos from VRChat, ChilloutVR and
          NeosVR
        </h1>
        <div className={classes.betaMessage}>
          Beta - this app is a work in progress and all content on the site is
          not filtered and may contain NSFW or offensive content
        </div>
        <div className={classes.controls}>
          <Button size="large" icon={<GetAppIcon />} isDisabled>
            Download App
          </Button>
          <br />
          App is not available to download yet
        </div>
        {results && <PhotoResults photos={results} />}
      </div>
    </>
  )
}
