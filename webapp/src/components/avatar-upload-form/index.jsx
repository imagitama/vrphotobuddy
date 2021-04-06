import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import OptimizedImageUploader from '../optimized-image-uploader'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { CollectionNames, UserFieldNames } from '../../firestore'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import defaultAvatarUrl from '../../assets/images/default-avatar.png'

const useStyles = makeStyles({
  container: {
    position: 'relative',
    width: '200px',
    height: '200px'
  },
  image: {
    width: '200px',
    height: '200px'
  },
  msg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#FFF',
    padding: '0.25rem 0',
    width: '100%',
    textAlign: 'center'
  }
})

export default ({ onClick = null }) => {
  const userId = useFirebaseUserId()
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [isSaving, , isErrored, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )

  const onUploadedUrl = async url => {
    try {
      if (onClick) {
        onClick()
      }

      await save({
        [UserFieldNames.avatarUrl]: url,
        [UserFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [UserFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSaving || !user) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to upload your avatar</ErrorMessage>
  }

  const { [UserFieldNames.avatarUrl]: avatarUrl } = user

  return (
    <OptimizedImageUploader
      onUploadedUrl={onUploadedUrl}
      directoryPath={`avatars/${userId}`}
      requiredWidth={200}
      requiredHeight={200}>
      <div className={classes.container}>
        <img
          src={avatarUrl ? avatarUrl : defaultAvatarUrl}
          className={classes.image}
          alt="Avatar upload preview"
        />
        <div className={classes.msg}>Click to edit</div>
      </div>
    </OptimizedImageUploader>
  )
}
