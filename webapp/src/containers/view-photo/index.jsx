import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { Helmet } from 'react-helmet'

import useDatabaseQuery, {
  options,
  mapDates,
  Operators,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import { CollectionNames, PhotoFieldNames } from '../../firestore'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import Markdown from '../../components/markdown'

import * as routes from '../../routes'
import { canEditPhoto } from '../../permissions'
import { createRef, getOpenGraphUrlForRouteUrl } from '../../utils'
import { useParams } from 'react-router'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  photo: {
    '& img': {
      width: '100%'
    }
  }
})

export default () => {
  const { photoId } = useParams()
  const [, , user] = useUserRecord()
  const [isLoading, isError, photo] = useDatabaseQuery(
    CollectionNames.Photos,
    photoId,
    { [options.populateRefs]: true }
  )
  const classes = useStyles()

  if (isLoading || !photo) {
    return <LoadingIndicator message="Loading photo..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load photo</ErrorMessage>
  }

  const { title, description, sourceUrl } = photo

  const hasPermissionToEdit = canEditPhoto(user)

  return (
    <div className={classes.root}>
      <Helmet>
        <title>{`${title} | View photo | vrphotobuddy`}</title>
        <meta name="description" content={`View the photo ${title}`} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={`View the photo "${title}".`}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewPhotoWithVar.replace(':photoId', photoId)
          )}
        />
        <meta property="og:site_name" content="vrphotobuddy" />
      </Helmet>
      <div>
        <div className={classes.photo}>
          <img src={sourceUrl} />
        </div>
        <div className={classes.meta}>
          <Heading variant="h1">{title || '(untitled)'}</Heading>
          {description && <Markdown source={description} />}
        </div>
      </div>
    </div>
  )
}
