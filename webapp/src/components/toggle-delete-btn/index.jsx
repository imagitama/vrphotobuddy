import React from 'react'
import DeleteIcon from '@material-ui/icons/Delete'
import RestoreFromTrashIcon from '@material-ui/icons/RestoreFromTrash'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, PhotoFieldNames } from '../../firestore'
import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import Button from '../button'

export default ({ photoId, currentStatus, hideLabel = false }) => {
  const userId = useFirebaseUserId()
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.Photos, photoId)

  const onClick = async () => {
    try {
      await save({
        [PhotoFieldNames.status]: currentStatus === 0 ? 1 : 0,
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
      icon={currentStatus === 0 ? <DeleteIcon /> : <RestoreFromTrashIcon />}>
      {hideLabel !== true
        ? isSaving
          ? 'Saving...'
          : currentStatus === 0
          ? 'Delete'
          : 'Restore'
        : ''}
    </Button>
  )
}
