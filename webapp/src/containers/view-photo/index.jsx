import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useParams, useHistory } from 'react-router'
import { Helmet } from 'react-helmet'
import CreateIcon from '@material-ui/icons/Create'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { Link } from 'react-router-dom'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'
import NightsStayIcon from '@material-ui/icons/NightsStay'
import TagFacesIcon from '@material-ui/icons/TagFaces'
import LazyLoad from 'react-lazyload'

import useDatabaseQuery, { options } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import Markdown from '../../components/markdown'
import ChangeAlbumForm from '../../components/change-album-form'
import TextInput from '../../components/text-input'
import TagInput from '../../components/tag-input'
import TagChip from '../../components/tag-chip'
import SuccessMessage from '../../components/success-message'

import * as routes from '../../routes'
import { canEditPhoto } from '../../permissions'
import { createRef, getOpenGraphUrlForRouteUrl } from '../../utils'
import { handleError } from '../../error-handling'
import {
  CollectionNames,
  PhotoFieldNames,
  UserFieldNames
} from '../../firestore'
import placeholderUrl from '../../assets/images/placeholder-photo.webp'
import TogglePrivacyBtn from '../../components/toggle-privacy-btn'
import ToggleIsAdult from '../../components/toggle-is-adult'
import QuickTagInput from '../../components/quick-tag-input'
import TagUserForm from '../../components/tag-user-form'
import LikeButton from '../../components/like-button'
import CommentList from '../../components/comment-list'
import AddCommentForm from '../../components/add-comment-form'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  meta: {
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex'
  },
  control: {
    marginLeft: '0.25rem'
  },
  photo: {
    position: 'relative',
    margin: '0 auto',
    padding: '0 100px',
    maxWidth: '1500px',
    '& img': {
      width: '100%'
    }
  },
  photoWrapper: {
    position: 'relative'
  },
  photoNavigationBtn: {
    width: '100px',
    position: 'absolute',
    top: '50%',
    transform: 'translateX(-25%)',
    cursor: 'pointer',
    '& svg': {
      fontSize: '500%'
    }
  },
  prev: {
    left: 0
  },
  next: {
    right: 0,
    textAlign: 'right'
  },
  actualPhoto: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  field: {
    width: '100%',
    marginBottom: '1rem'
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
      <br />
      <br />
      <Button onClick={onSaveClick}>Save</Button>
    </div>
  )
}

const getPrevId = (photoId, specialResult) => {
  if (!specialResult) {
    return null
  }

  const idx = specialResult.ids.indexOf(photoId)

  if (idx === 0) {
    return null
  }

  return specialResult.ids[idx - 1]
}

const getNextId = (photoId, specialResult) => {
  if (!specialResult) {
    return null
  }

  const idx = specialResult.ids.indexOf(photoId)

  if (idx === specialResult.ids.length - 1) {
    return null
  }

  return specialResult.ids[idx + 1]
}

const defaultTitle = '(untitled)'

export default () => {
  const { photoId } = useParams()
  const [, , user] = useUserRecord()
  const userId = useFirebaseUserId()
  const [isLoading, isError, photo] = useDatabaseQuery(
    CollectionNames.Photos,
    photoId,
    { [options.populateRefs]: true, [options.subscribe]: true }
  )
  const [, , specialResult] = useDatabaseQuery(
    CollectionNames.Special,
    'all-photo-ids'
  )
  const classes = useStyles()
  const [isEditorVisible, setIsEditorVisible] = useState(false)
  const { push } = useHistory()
  const photoContainerRef = useRef()
  const [isTaggingUser, setIsTaggingUser] = useState(false)

  const prevId = getPrevId(photoId, specialResult)
  const nextId = getNextId(photoId, specialResult)

  const goNext = () =>
    nextId !== null && push(routes.viewPhotoWithVar.replace(':photoId', nextId))
  const goPrev = () =>
    prevId !== null && push(routes.viewPhotoWithVar.replace(':photoId', prevId))

  useEffect(() => {
    const handler = e => {
      if (e.keyCode === 37) {
        goPrev()
      } else if (e.keyCode === 39) {
        goNext()
      }
    }

    document.addEventListener('keydown', handler)

    return () => document.removeEventListener('keydown', handler)
  }, [nextId, prevId])

  if (isLoading || !photo) {
    return <LoadingIndicator message="Loading photo..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load photo</ErrorMessage>
  }

  const {
    title,
    description,
    albums = [],
    [PhotoFieldNames.sourceUrl]: sourceUrl,
    tags,
    [PhotoFieldNames.privacy]: privacy,
    [PhotoFieldNames.isAdult]: isAdult,
    [PhotoFieldNames.userTags]: userTags = [],
    [PhotoFieldNames.userTagPositions]: userTagPositions = [],
    createdBy
  } = photo

  const hasPermissionToEdit = canEditPhoto(user, photo)

  return (
    <div className={classes.root}>
      <Helmet>
        <title>{`${title ||
          defaultTitle} | View photo | VR Photo Buddy`}</title>
        <meta
          name="description"
          content={`View the photo ${title || defaultTitle}`}
        />
        <meta property="og:title" content={title || defaultTitle} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={sourceUrl} />
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
        <meta property="og:site_name" content="VR Photo Buddy" />
      </Helmet>
      <div>
        <div className={classes.photo}>
          {prevId !== null && (
            <div
              className={`${classes.photoNavigationBtn} ${classes.prev}`}
              onClick={goPrev}>
              <ChevronLeftIcon />
            </div>
          )}
          {nextId !== null && (
            <div
              className={`${classes.photoNavigationBtn} ${classes.next}`}
              onClick={goNext}>
              <ChevronRightIcon />
            </div>
          )}
          <div className={classes.photoWrapper}>
            <img
              src={placeholderUrl}
              className={classes.placeholder}
              alt="Placeholder photo"
            />
            <img
              src={sourceUrl}
              className={classes.actualPhoto}
              alt="Source photo"
            />
            <TagUserForm
              photoId={photoId}
              isTagging={isTaggingUser}
              currentTags={userTags}
              currentTagPositions={userTagPositions}
              canEdit={hasPermissionToEdit}
              onDone={() => setIsTaggingUser(false)}
              onCancel={() => setIsTaggingUser(false)}
            />
          </div>
        </div>
        <div className={classes.meta}>
          <Heading variant="h1">
            <Link to={routes.viewPhotoWithVar.replace(':photoId', photoId)}>
              {title || defaultTitle}
            </Link>
            &nbsp;
            {privacy === 1 ? (
              <span title="Private">
                <VisibilityOffIcon />
              </span>
            ) : (
              ''
            )}
            &nbsp;
            {isAdult === true ? (
              <span title="NSFW (Adult)">
                <NightsStayIcon />
              </span>
            ) : (
              ''
            )}
          </Heading>
          <Heading variant="h2">
            By{' '}
            <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
              {createdBy[UserFieldNames.username]}
            </Link>
          </Heading>
          {description && <Markdown source={description} />}
          {tags.map(tagName => (
            <TagChip key={tagName} tagName={tagName} />
          ))}
          <LazyLoad>
            <CommentList
              collectionName={CollectionNames.Photos}
              parentId={photoId}
            />
          </LazyLoad>
          <LazyLoad>
            <AddCommentForm
              collectionName={CollectionNames.Photos}
              parentId={photoId}
            />
          </LazyLoad>

          <div className={classes.controls}>
            <div className={classes.control}>
              <LikeButton photoId={photoId} />
            </div>
            {hasPermissionToEdit && (
              <>
                <div className={classes.control}>
                  <Button
                    onClick={() => setIsTaggingUser(currentVal => !currentVal)}
                    icon={<TagFacesIcon />}>
                    Tag Someone
                  </Button>
                </div>
                <div className={classes.control}>
                  <ChangeAlbumForm
                    photoId={photoId}
                    existingAlbumRefs={albums}
                  />
                </div>
                <div className={classes.control}>
                  <Button
                    onClick={() =>
                      setIsEditorVisible(currentVal => !currentVal)
                    }
                    icon={<CreateIcon />}>
                    Edit
                  </Button>
                </div>
                <div className={classes.control}>
                  <TogglePrivacyBtn
                    photoId={photoId}
                    currentPrivacy={privacy}
                  />
                </div>
                <div className={classes.control}>
                  <ToggleIsAdult photoId={photoId} currentIsAdult={isAdult} />
                </div>
              </>
            )}
          </div>
          {isEditorVisible && <Editor existingFields={photo} />}
        </div>
      </div>
    </div>
  )
}
