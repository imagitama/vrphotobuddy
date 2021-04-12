import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'
import CreateIcon from '@material-ui/icons/Create'

import useDatabaseQuery, {
  options,
  Operators
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import Markdown from '../../components/markdown'
import PhotoResults from '../../components/photo-results'
import NoResultsMessage from '../../components/no-results-message'
import SuccessMessage from '../../components/success-message'
import TagInput from '../../components/tag-input'
import TextInput from '../../components/text-input'
import TagChip from '../../components/tag-chip'

import * as routes from '../../routes'
import { createRef, getOpenGraphUrlForRouteUrl } from '../../utils'
import {
  CollectionNames,
  PhotoFieldNames,
  UserFieldNames,
  AlbumFieldNames
} from '../../firestore'
import { handleError } from '../../error-handling'

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
  },
  field: {
    width: '100%',
    marginBottom: '1rem'
  }
})

const PhotosForAlbum = ({ albumId }) => {
  const [isLoading, isError, photos] = useDatabaseQuery(
    CollectionNames.Photos,
    [
      [
        PhotoFieldNames.albums,
        Operators.ARRAY_CONTAINS,
        createRef(CollectionNames.Albums, albumId)
      ],
      [
        PhotoFieldNames.privacy,
        Operators.EQUALS,
        0 // public
      ]
    ],
    {
      [options.populateRefs]: true,
      [options.subscribe]: true,
      [options.orderBy]: [PhotoFieldNames.createdAt, OrderDirections.DESC]
    }
  )
  const classes = useStyles()

  if (isLoading || !photos) {
    return <LoadingIndicator message="Loading photos for album..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load photos for album</ErrorMessage>
  }

  if (!photos.length) {
    return <NoResultsMessage>This album has no photos</NoResultsMessage>
  }

  return <PhotoResults photos={photos} />
}

function Editor({ existingFields }) {
  const { albumId } = useParams()
  const userId = useFirebaseUserId()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Albums,
    albumId
  )
  const [newFields, setNewFields] = useState({
    [AlbumFieldNames.title]: existingFields[AlbumFieldNames.title],
    [AlbumFieldNames.description]: existingFields[AlbumFieldNames.description],
    [AlbumFieldNames.tags]: existingFields[AlbumFieldNames.tags] || []
  })
  const classes = useStyles()

  const onFieldChanged = (fieldName, newVal) =>
    setNewFields(currentVal => ({
      ...currentVal,
      [fieldName]: newVal
    }))

  if (isSaving) {
    return <LoadingIndicator message="Saving album..." />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Album saved!</SuccessMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save album</ErrorMessage>
  }

  const onSaveClick = async () => {
    try {
      await save({
        ...newFields,
        [AlbumFieldNames.lastModifiedAt]: new Date(),
        [AlbumFieldNames.lastModifiedBy]: createRef(
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
      {isSaveSuccess && <SuccessMessage>Album has been edited</SuccessMessage>}
      {isSaveError && <ErrorMessage>Failed to edit album</ErrorMessage>}
      Title
      <br />
      <TextInput
        value={newFields[AlbumFieldNames.title]}
        onChange={e => onFieldChanged(AlbumFieldNames.title, e.target.value)}
        className={classes.field}
      />
      Description
      <br />
      <TextInput
        value={newFields[AlbumFieldNames.description]}
        onChange={e =>
          onFieldChanged(AlbumFieldNames.description, e.target.value)
        }
        className={classes.field}
        rows={5}
        multiline
      />
      Tags
      <br />
      <TagInput
        currentTags={newFields[AlbumFieldNames.tags]}
        onChange={newTags => onFieldChanged(AlbumFieldNames.tags, newTags)}
      />
      <br />
      <br />
      <Button onClick={onSaveClick}>Save</Button>
    </div>
  )
}

export default () => {
  const { albumId } = useParams()
  const [, , user] = useUserRecord()
  const [isLoading, isError, album] = useDatabaseQuery(
    CollectionNames.Albums,
    albumId,
    { [options.populateRefs]: true, [options.subscribe]: true }
  )
  const classes = useStyles()
  const [isEditorVisible, setIsEditorVisible] = useState(false)

  if (isLoading || !album) {
    return <LoadingIndicator message="Loading album..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load album</ErrorMessage>
  }

  const { title, description, sourceUrl, createdBy, tags = [] } = album

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
        <meta property="og:site_name" content="VR Photo Buddy" />
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
          {tags.map(tagName => (
            <TagChip key={tagName} tagName={tagName} />
          ))}
          <PhotosForAlbum albumId={albumId} />
        </div>
        {user && (
          <div className={classes.controls}>
            <Button
              onClick={() => setIsEditorVisible(currentVal => !currentVal)}
              icon={<CreateIcon />}>
              Edit
            </Button>
          </div>
        )}
        {isEditorVisible && <Editor existingFields={album} />}
      </div>
    </div>
  )
}
