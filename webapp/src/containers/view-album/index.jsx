import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { Helmet } from 'react-helmet'

import useDatabaseQuery, {
  options,
  mapDates,
  Operators,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  CollectionNames,
  PhotoFieldNames,
  UserFieldNames
} from '../../firestore'
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
import PhotoResults from '../../components/photo-results'
import NoResultsMessage from '../../components/no-results-message'
import SuccessMessage from '../../components/success-message'

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

const PhotosForAlbum = ({ albumId }) => {
  const [isLoading, isError, photos] = useDatabaseQuery(
    CollectionNames.Albums,
    [
      [
        PhotoFieldNames.album,
        Operators.EQUALS,
        createRef(CollectionNames.Albums, albumId)
      ]
    ],
    { [options.populateRefs]: true }
  )
  const classes = useStyles()

  if (isLoading || !photos) {
    return <LoadingIndicator message="Loading photos for album..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load photos for album</ErrorMessage>
  }

  if (!photos.length) {
    return <NoResultsMessage />
  }

  return <PhotoResults photos={photos} />
}

function Editor() {
  const { albumId } = useParams()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Albums,
    albumId
  )

  if (isSaving) {
    return <LoadingIndicator message="Saving album..." />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Album saved!</SuccessMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save album</ErrorMessage>
  }

  return <div>Editor!!!</div>
}

export default () => {
  const { albumId } = useParams()
  const [, , user] = useUserRecord()
  const [isLoading, isError, album] = useDatabaseQuery(
    CollectionNames.Albums,
    albumId,
    { [options.populateRefs]: true }
  )
  const classes = useStyles()
  const [isEditorVisible, setIsEditorVisible] = useState(false)

  if (isLoading || !album) {
    return <LoadingIndicator message="Loading album..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load album</ErrorMessage>
  }

  const { title, description, sourceUrl, createdBy } = album

  // const hasPermissionToEdit = canEditPhoto(user)

  return (
    <div className={classes.root}>
      <Helmet>
        <title>{`${title} | View album | vralbumbuddy`}</title>
        <meta name="description" content={`View the album ${title}`} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={`View the album "${title}".`}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewAlbumWithVar.replace(':albumId', albumId)
          )}
        />
        <meta property="og:site_name" content="vrphotobuddy" />
      </Helmet>
      <div>
        <div className={classes.photo}>
          <img src={sourceUrl} />
        </div>
        <div className={classes.meta}>
          <Heading variant="h1">{title}</Heading>
          <Heading variant="h2">
            By {createdBy[UserFieldNames.username]}
          </Heading>
          {description && <Markdown source={description} />}
          <PhotosForAlbum albumId={albumId} />
        </div>
        {user && (
          <Button onClick={() => setIsEditorVisible(currentVal => !currentVal)}>
            Edit
          </Button>
        )}
        {isEditorVisible && <Editor />}
      </div>
    </div>
  )
}
