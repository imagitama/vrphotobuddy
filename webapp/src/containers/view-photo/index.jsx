import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'
import CreateIcon from '@material-ui/icons/Create'

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
import TextInput from '../../components/text-input'

import * as routes from '../../routes'
import { canEditPhoto } from '../../permissions'
import { createRef, getOpenGraphUrlForRouteUrl } from '../../utils'
import SuccessMessage from '../../components/success-message'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import TagInput from '../../components/tag-input'
import TagChip from '../../components/tag-chip'

const useStyles = makeStyles({
  meta: {
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  photo: {
    margin: '0 auto',
    maxWidth: '1500px',
    '& img': {
      width: '100%'
    }
  }
})

function Editor({ existingFields }) {
  const { photoId } = useParams()
  const userId = useFirebaseUserId()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Photos,
    photoId
  )
  const [newFields, setNewFields] = useState({
    [PhotoFieldNames.title]: existingFields[PhotoFieldNames.title],
    [PhotoFieldNames.description]: existingFields[PhotoFieldNames.description],
    [PhotoFieldNames.tags]: existingFields[PhotoFieldNames.tags]
  })
  const classes = useStyles()

  const onFieldChanged = (fieldName, newVal) =>
    setNewFields(currentVal => ({
      ...currentVal,
      [fieldName]: newVal
    }))

  if (isSaving) {
    return <LoadingIndicator message="Saving photo..." />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Photo saved!</SuccessMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save photo</ErrorMessage>
  }

  const onSaveClick = async () => {
    try {
      await save({
        ...newFields,
        [PhotoFieldNames.lastModifiedAt]: new Date(),
        [PhotoFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <div>
      {isSaving && <LoadingIndicator message="Saving..." />}
      {isSaveSuccess && (
        <SuccessMessage>
          Album has been created <Button>View Album</Button>
        </SuccessMessage>
      )}
      {isSaveError && <ErrorMessage>Failed to create album</ErrorMessage>}
      Title
      <br />
      <TextInput
        value={newFields[PhotoFieldNames.title]}
        onChange={e => onFieldChanged(PhotoFieldNames.title, e.target.value)}
        className={classes.field}
      />
      Description
      <br />
      <TextInput
        value={newFields[PhotoFieldNames.description]}
        onChange={e =>
          onFieldChanged(PhotoFieldNames.description, e.target.value)
        }
        className={classes.field}
        rows={5}
        multiline
      />
      Tags
      <br />
      <TagInput
        currentTags={newFields[PhotoFieldNames.tags]}
        onChange={newTags => onFieldChanged(PhotoFieldNames.tags, newTags)}
      />
      <Button onClick={onSaveClick}>Save</Button>
    </div>
  )
}

export default () => {
  const { photoId } = useParams()
  const [, , user] = useUserRecord()
  const [isLoading, isError, photo] = useDatabaseQuery(
    CollectionNames.Photos,
    photoId,
    { [options.populateRefs]: true, [options.subscribe]: true }
  )
  const classes = useStyles()
  const [isEditorVisible, setIsEditorVisible] = useState(false)

  if (isLoading || !photo) {
    return <LoadingIndicator message="Loading photo..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load photo</ErrorMessage>
  }

  const { title, description, albums = [], sourceUrl, tags, createdBy } = photo

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
          {tags.map(tagName => (
            <TagChip key={tagName} tagName={tagName} />
          ))}
          <div className={classes.controls}>
            {user && (
              <ChangeAlbumForm photoId={photoId} existingAlbumRefs={albums} />
            )}{' '}
            {user && (
              <Button
                onClick={() => setIsEditorVisible(currentVal => !currentVal)}
                icon={<CreateIcon />}>
                Edit
              </Button>
            )}
          </div>
          {isEditorVisible && <Editor existingFields={photo} />}
        </div>
      </div>
    </div>
  )
}
