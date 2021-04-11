import React from 'react'
import VisibilityIcon from '@material-ui/icons/Visibility'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, PhotoFieldNames } from '../../firestore'
import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import Button from '../button'

export default ({ photoId, currentPrivacy, hideLabel = false }) => {
  const userId = useFirebaseUserId()
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.Photos, photoId)

  const onClick = async () => {
    try {
      await save({
        [PhotoFieldNames.privacy]: currentPrivacy === 0 ? 1 : 0,
        [PhotoFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [PhotoFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save photo to database', err)
      handleError(err)
    }
  }

  return (
    <Button
      onClick={onClick}
      icon={currentPrivacy === 0 ? <VisibilityOffIcon /> : <VisibilityIcon />}>
      {hideLabel !== true
        ? isSaving
          ? 'Saving...'
          : currentPrivacy === 0
          ? 'Make Private'
          : 'Make Public'
        : ''}
    </Button>
  )
}
