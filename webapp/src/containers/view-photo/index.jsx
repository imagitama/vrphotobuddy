import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { useParams } from 'react-router'
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
  UserFieldNames,
  AlbumFieldNames
} from '../../firestore'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import Markdown from '../../components/markdown'
import Dropdown from '../../components/dropdown'
import ChangeAlbumForm from '../../components/change-album-form'

import * as routes from '../../routes'
import { canEditPhoto } from '../../permissions'
import { createRef, getOpenGraphUrlForRouteUrl } from '../../utils'
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

function Editor() {
  const { photoId } = useParams()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Photos,
    photoId
  )

  if (isSaving) {
    return <LoadingIndicator message="Saving photo..." />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Photo saved!</SuccessMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save photo</ErrorMessage>
  }

  return <div>Editor!!!</div>
}

export default () => {
  const { photoId } = useParams()
  const [, , user] = useUserRecord()
  const [isLoading, isError, photo] = useDatabaseQuery(
    CollectionNames.Photos,
    photoId,
    { [options.populateRefs]: true }
  )
  const classes = useStyles()
  const [isEditorVisible, setIsEditorVisible] = useState(false)

  if (isLoading || !photo) {
    return <LoadingIndicator message="Loading photo..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load photo</ErrorMessage>
  }

  const { title, description, albums = [], sourceUrl, createdBy } = photo

  const hasPermissionToEdit = canEditPhoto(user, photo)

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
          <Heading variant="h2">
            By {createdBy[UserFieldNames.username]}
          </Heading>
          {description && <Markdown source={description} />}
          {user && (
            <ChangeAlbumForm photoId={photoId} existingAlbumRefs={albums} />
          )}
          {user && (
            <Button
              onClick={() => setIsEditorVisible(currentVal => !currentVal)}>
              Edit
            </Button>
          )}{' '}
          {isEditorVisible && <Editor />}
        </div>
      </div>
    </div>
  )
}
